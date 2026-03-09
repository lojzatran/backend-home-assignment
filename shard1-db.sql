CREATE TABLE vehicle_state(
    id SERIAL NOT NULL,
    car_id integer,
    time timestamp without time zone,
    state_of_charge integer,
    latitude double precision,
    longitude double precision,
    gear integer,
    speed double precision
);

