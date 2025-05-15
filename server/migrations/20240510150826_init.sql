create table users (
  idp varchar(255) not null,
  idp_id varchar(255) not null,
  name varchar(255) not null,
  email varchar(255) not null,

  primary key (idp, idp_id)
);

create table tracks (
  uid varchar(24) not null,
  idp varchar(255) not null,
  idp_id varchar(255) not null,
  source varchar(255) not null,
  title varchar(255),
  artist varchar(255),
  genre varchar(255),
  duration double not null,

  primary key (uid),
  key idp_idx (idp, idp_id)
);

create table playlists (
  idp varchar(255) not null,
  idp_id varchar(255) not null,
  name varchar(255) not null,
  tracks json not null,

  primary key (idp, idp_id, name)
);
