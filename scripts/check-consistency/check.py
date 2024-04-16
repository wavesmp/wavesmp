from collections import defaultdict
from functools import partial
import json
import os
import sys

from bson.objectid import ObjectId
import boto3
import pymongo

THISDIR = os.path.dirname(os.path.abspath(__file__))
OUTDIR = os.path.join(THISDIR, 'downloads')


def get_s3_track_ids(bucket):
    """
    Return the tracks ids in s3 as a mappping.
    idp -> idp_id -> set of track ids
    """
    s3_track_ids = defaultdict(partial(defaultdict, set))

    for obj in bucket.objects.all():
        key_parts = obj.key.split('/')
        if len(key_parts) != 3:
            print(f'Invalid key format. Skipping {obj.key}')
            continue

        idp, idp_id, track_id = key_parts
        if not track_id.endswith('.mp3'):
            print(f'Invalid key suffix. Skipping {obj.key}')
            continue

        track_id = track_id[:-4]
        s3_track_ids[idp][idp_id].add(track_id)

    return s3_track_ids


def get_mongo_track_ids(col):
    mongo_track_ids = defaultdict(partial(defaultdict, set))

    for doc in col.find():
        idp = doc['idp']
        idp_id = doc['idpId']
        track_id = str(doc['_id'])
        mongo_track_ids[idp][idp_id].add(track_id)
    return mongo_track_ids


def _compare_track_ids(tracks1, tracks2, tracks2_name):
    """
    Return track ids in tracks1, but not in tracks2.

    Where tracks1 and tracks2 are mappings of:
    idp -> idp_id -> set of track ids
    """
    missing = []
    for idp in tracks1:
        for idp_id in tracks1[idp]:
            for track_id in tracks1[idp][idp_id]:
                if (
                    idp not in tracks2
                    or idp_id not in tracks2[idp]
                    or track_id not in tracks2[idp][idp_id]
                ):
                    print(f'track id {idp}/{idp_id}/{track_id} not in {tracks2_name}')
                    missing.append([idp, idp_id, track_id])
    return missing


def compare_track_ids(s3_track_ids, mongo_track_ids):
    s3_mismatch = _compare_track_ids(s3_track_ids, mongo_track_ids, 'mongo')
    mongo_mismatch = _compare_track_ids(mongo_track_ids, s3_track_ids, 's3')
    return s3_mismatch, mongo_mismatch


def handle_s3_mismatch(mismatch, bucket):
    if len(mismatch) == 0:
        return

    os.makedirs(OUTDIR, exist_ok=True)
    for idp, idp_id, track_id in mismatch:
        key = f'{idp}/{idp_id}/{track_id}.mp3'
        outfile = os.path.join(OUTDIR, key.replace('/', '-'))
        print(f'Downloading s3 mismatch to {outfile}')
        bucket.download_file(key, outfile)


def handle_mongo_mismatch(mismatch, col):
    mismatch_docs = []
    for idp, idp_id, track_id in mismatch:
        doc = col.find_one({'idp': idp, 'idpId': idp_id, '_id': ObjectId(track_id)})
        doc['_id'] = str(doc['_id'])
        mismatch_docs.append(doc)
    print('Found mongo mismatches')
    print(json.dumps(mismatch_docs, indent=3))


def main():
    """
    Check for consistency between S3 and the mongo metadata server
    """
    assert len(sys.argv) == 2
    bucket_name = sys.argv[1]

    s3 = boto3.resource('s3')
    bucket = s3.Bucket(bucket_name)
    s3_track_ids = get_s3_track_ids(bucket)

    col = pymongo.MongoClient("waves-server-db", 27017).get_database('waves').get_collection('track')
    mongo_track_ids = get_mongo_track_ids(col)

    s3_mismatch, mongo_mismatch = compare_track_ids(s3_track_ids, mongo_track_ids)

    handle_s3_mismatch(s3_mismatch, bucket)
    handle_mongo_mismatch(mongo_mismatch, col)


if __name__ == '__main__':
    main()
