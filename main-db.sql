CREATE TABLE vehicle_state (
    id SERIAL NOT NULL,
    car_id integer,
    time timestamp without time zone,
    state_of_charge integer,
    latitude double precision,
    longitude double precision,
    gear integer,
    speed double precision
)
PARTITION BY
    RANGE (id);

CREATE EXTENSION IF NOT EXISTS postgres_fdw;

CREATE SERVER shard1_server FOREIGN DATA WRAPPER postgres_fdw OPTIONS (
    host 'postgres-shard-1',
    port '5432',
    dbname 'postgres'
);

CREATE USER MAPPING FOR postgres SERVER shard1_server OPTIONS (
    user 'postgres',
    password 'postgres'
);

CREATE FOREIGN TABLE vehicle_state_shard1 (
    id integer NOT NULL,
    car_id integer,
    time timestamp without time zone,
    state_of_charge integer,
    latitude double precision,
    longitude double precision,
    gear integer,
    speed double precision
) SERVER shard1_server OPTIONS (
    schema_name 'public',
    table_name 'vehicle_state'
);

CREATE SERVER shard2_server FOREIGN DATA WRAPPER postgres_fdw OPTIONS (
    host 'postgres-shard-2',
    dbname 'postgres',
    port '5432'
);

CREATE USER MAPPING FOR postgres SERVER shard2_server OPTIONS (
    user 'postgres',
    password 'postgres'
);

CREATE FOREIGN TABLE vehicle_state_shard2 (
    id integer NOT NULL,
    car_id integer,
    time timestamp without time zone,
    state_of_charge integer,
    latitude double precision,
    longitude double precision,
    gear integer,
    speed double precision
) SERVER shard2_server OPTIONS (
    schema_name 'public',
    table_name 'vehicle_state'
);

CREATE SERVER shard3_server FOREIGN DATA WRAPPER postgres_fdw OPTIONS (
    host 'postgres-shard-3',
    dbname 'postgres',
    port '5432'
);

CREATE USER MAPPING FOR postgres SERVER shard3_server OPTIONS (
    user 'postgres',
    password 'postgres'
);

CREATE FOREIGN TABLE vehicle_state_shard3 (
    id integer NOT NULL,
    car_id integer,
    time timestamp without time zone,
    state_of_charge integer,
    latitude double precision,
    longitude double precision,
    gear integer,
    speed double precision
) SERVER shard3_server OPTIONS (
    schema_name 'public',
    table_name 'vehicle_state'
);

ALTER TABLE vehicle_state ATTACH PARTITION vehicle_state_shard1 FOR
VALUES
FROM (1) TO (100);

ALTER TABLE vehicle_state ATTACH PARTITION vehicle_state_shard2 FOR
VALUES
FROM (100) TO (200);

ALTER TABLE vehicle_state ATTACH PARTITION vehicle_state_shard3 FOR
VALUES
FROM (200) TO (MAXVALUE);