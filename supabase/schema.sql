create table if not exists public.globals (
    id text primary key,
    counting jsonb,
    canvas jsonb default jsonb_build_object('data', jsonb_build_object(), 'size', 0)
);

create table if not exists public.users (
    id text primary key,
    starboard jsonb default jsonb_build_object('tier1', 0, 'tier2', 0, 'tier3', 0)
);

create table if not exists public.zhenft_globals (
    id text primary key,
    item_shop jsonb default '{}'::jsonb
);

create table if not exists public.zhenft_users (
    id text primary key,
    library jsonb default '{}'::jsonb,
    library_max_increment bigint default 0,
    token bigint default 0,
    token_max_increment bigint default 0,
    token_total bigint default 0,
    collection_total bigint default 0,
    daily_streak jsonb default jsonb_build_object('amount', 0, 'lastClaimed', 0),
    effects jsonb default '{}'::jsonb,
    items jsonb default jsonb_build_object(
        'inventory',
        jsonb_build_object(),
        'active',
        jsonb_build_object()
    ),
    badges jsonb default '{}'::jsonb,
    time_start bigint default 0
);
