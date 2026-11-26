import { assert, describe, it } from "vitest";

import { processTrack } from "./processTrack";

/* ID3v2.3 text frame, ISO-8859-1 encoded */
function textFrame(id: string, text: string): number[] {
  const data = [0, ...Buffer.from(text, "latin1")];
  const size = Buffer.alloc(4);
  size.writeUInt32BE(data.length);
  return [...Buffer.from(id), ...size, 0, 0, ...data];
}

/* ID3v2.3 tag with the given text frames. Its size is syncsafe */
function id3Tag(frames: number[][]): number[] {
  const body = frames.flat();
  const n = body.length;
  const size = [(n >> 21) & 0x7f, (n >> 14) & 0x7f, (n >> 7) & 0x7f, n & 0x7f];
  return [...Buffer.from("ID3"), 3, 0, 0, ...size, ...body];
}

/* MPEG-1 Layer III frames: 128 kbps, 44.1 kHz, no padding, so each frame is
 * 417 bytes and holds 1152 samples */
const FRAME_LENGTH = 417;
const SAMPLES_PER_FRAME = 1152;
const SAMPLE_RATE = 44100;
function mpegFrames(count: number): number[] {
  const frame = new Array<number>(FRAME_LENGTH).fill(0);
  frame.splice(0, 4, 0xff, 0xfb, 0x90, 0x00);
  return Array.from({ length: count }, () => frame).flat();
}

function mp3File(name: string, tags: number[][], frameCount: number): File {
  const bytes = [...id3Tag(tags), ...mpegFrames(frameCount)];
  return new File([new Uint8Array(bytes)], name, { type: "audio/mpeg" });
}

describe("#processTrack()", () => {
  it("reads the track info from the file's tags", async () => {
    const frameCount = 40;
    const file = mp3File(
      "test.mp3",
      [
        textFrame("TIT2", " testTitle "),
        textFrame("TPE1", "testArtist"),
        textFrame("TALB", "testAlbum "),
        textFrame("TCON", "testGenre"),
      ],
      frameCount,
    );

    const track = await processTrack(file);

    assert.match(track.id, /^[0-9a-f]{24}$/);
    assert.deepEqual(
      {
        source: track.source,
        title: track.title,
        artist: track.artist,
        album: track.album,
        genre: track.genre,
        file: track.file,
      },
      {
        source: "file",
        title: "testTitle",
        artist: "testArtist",
        album: "testAlbum",
        genre: "testGenre",
        file,
      },
    );
    const expectedDuration = (frameCount * SAMPLES_PER_FRAME) / SAMPLE_RATE;
    assert.approximately(track.duration, expectedDuration, 0.05);
  });

  it("falls back to the album artist", async () => {
    const file = mp3File(
      "test.mp3",
      [textFrame("TIT2", "testTitle"), textFrame("TPE2", "testAlbumArtist")],
      10,
    );

    const track = await processTrack(file);

    assert.strictEqual(track.artist, "testAlbumArtist");
  });

  it("falls back to the file name when tags are missing", async () => {
    const file = mp3File("someArtist - someTitle.mp3", [], 10);

    const track = await processTrack(file);

    assert.strictEqual(track.artist, "someArtist");
    assert.strictEqual(track.title, "someTitle");
    assert.strictEqual(track.album, "Unknown album");
    assert.strictEqual(track.genre, "Unknown genre");
  });
});
