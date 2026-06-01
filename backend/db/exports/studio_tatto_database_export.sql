--
-- PostgreSQL database dump
--

\restrict wE0JjcYLcd9kgLLSqNByd7aJz9eDS4E5ElWaUjiCAwbtQFpm4c0F08hXbVPwv7h

-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: app; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA app;


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: contact_kind; Type: TYPE; Schema: app; Owner: -
--

CREATE TYPE app.contact_kind AS ENUM (
    'phone',
    'email',
    'address',
    'hours',
    'whatsapp',
    'instagram',
    'facebook',
    'other'
);


--
-- Name: hero_background_type; Type: TYPE; Schema: app; Owner: -
--

CREATE TYPE app.hero_background_type AS ENUM (
    'image',
    'video'
);


--
-- Name: link_placement; Type: TYPE; Schema: app; Owner: -
--

CREATE TYPE app.link_placement AS ENUM (
    'header',
    'footer',
    'cta',
    'other'
);


--
-- Name: review_status; Type: TYPE; Schema: app; Owner: -
--

CREATE TYPE app.review_status AS ENUM (
    'published',
    'pending',
    'rejected'
);


--
-- Name: social_platform; Type: TYPE; Schema: app; Owner: -
--

CREATE TYPE app.social_platform AS ENUM (
    'instagram',
    'facebook',
    'tiktok',
    'youtube',
    'whatsapp',
    'email',
    'other'
);


--
-- Name: submission_status; Type: TYPE; Schema: app; Owner: -
--

CREATE TYPE app.submission_status AS ENUM (
    'new',
    'in_progress',
    'done',
    'archived'
);


--
-- Name: set_updated_at(); Type: FUNCTION; Schema: app; Owner: -
--

CREATE FUNCTION app.set_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: update_course_timestamp(); Type: FUNCTION; Schema: app; Owner: -
--

CREATE FUNCTION app.update_course_timestamp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;


--
-- Name: update_images_timestamp(); Type: FUNCTION; Schema: app; Owner: -
--

CREATE FUNCTION app.update_images_timestamp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;


--
-- Name: update_portfolio_timestamp(); Type: FUNCTION; Schema: app; Owner: -
--

CREATE FUNCTION app.update_portfolio_timestamp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;


--
-- Name: update_specialists_timestamp(); Type: FUNCTION; Schema: app; Owner: -
--

CREATE FUNCTION app.update_specialists_timestamp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: contact_info; Type: TABLE; Schema: app; Owner: -
--

CREATE TABLE app.contact_info (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    site_id uuid NOT NULL,
    kind app.contact_kind NOT NULL,
    label text,
    value text NOT NULL,
    link_url text,
    sort_order integer DEFAULT 0 NOT NULL,
    is_primary boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT contact_value_not_empty CHECK ((length(TRIM(BOTH FROM value)) > 0))
);


--
-- Name: contact_submission; Type: TABLE; Schema: app; Owner: -
--

CREATE TABLE app.contact_submission (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    site_id uuid NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    phone text,
    message text NOT NULL,
    status app.submission_status DEFAULT 'new'::app.submission_status NOT NULL,
    submitted_at timestamp with time zone DEFAULT now() NOT NULL,
    handled_at timestamp with time zone,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT contact_email_not_empty CHECK ((length(TRIM(BOTH FROM email)) > 0)),
    CONSTRAINT contact_name_not_empty CHECK ((length(TRIM(BOTH FROM name)) > 0))
);


--
-- Name: course; Type: TABLE; Schema: app; Owner: -
--

CREATE TABLE app.course (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    site_id uuid NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    next_class text,
    price text,
    price_note text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT course_title_not_empty CHECK ((length(TRIM(BOTH FROM title)) > 0))
);


--
-- Name: course_enrollment; Type: TABLE; Schema: app; Owner: -
--

CREATE TABLE app.course_enrollment (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    course_id uuid NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    phone text,
    message text,
    status app.submission_status DEFAULT 'new'::app.submission_status NOT NULL,
    submitted_at timestamp with time zone DEFAULT now() NOT NULL,
    handled_at timestamp with time zone,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT enrollment_email_not_empty CHECK ((length(TRIM(BOTH FROM email)) > 0)),
    CONSTRAINT enrollment_name_not_empty CHECK ((length(TRIM(BOTH FROM name)) > 0))
);


--
-- Name: course_extra_info; Type: TABLE; Schema: app; Owner: -
--

CREATE TABLE app.course_extra_info (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    course_id uuid NOT NULL,
    text text NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT course_extra_text_not_empty CHECK ((length(TRIM(BOTH FROM text)) > 0))
);


--
-- Name: course_feature; Type: TABLE; Schema: app; Owner: -
--

CREATE TABLE app.course_feature (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    course_id uuid NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT course_feature_title_not_empty CHECK ((length(TRIM(BOTH FROM title)) > 0))
);


--
-- Name: course_highlight; Type: TABLE; Schema: app; Owner: -
--

CREATE TABLE app.course_highlight (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    course_id uuid NOT NULL,
    text text NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT course_highlight_text_not_empty CHECK ((length(TRIM(BOTH FROM text)) > 0))
);


--
-- Name: hero; Type: TABLE; Schema: app; Owner: -
--

CREATE TABLE app.hero (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    site_id uuid NOT NULL,
    background_type app.hero_background_type NOT NULL,
    background_url text NOT NULL,
    headline text,
    subheadline text,
    cta_primary_label text,
    cta_primary_href text,
    cta_secondary_label text,
    cta_secondary_href text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: location; Type: TABLE; Schema: app; Owner: -
--

CREATE TABLE app.location (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    site_id uuid NOT NULL,
    name text,
    address_line1 text,
    address_line2 text,
    city text,
    state text,
    country text,
    postal_code text,
    latitude numeric(9,6),
    longitude numeric(9,6),
    map_embed_url text,
    reference text,
    parking_info text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: media_asset; Type: TABLE; Schema: app; Owner: -
--

CREATE TABLE app.media_asset (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    site_id uuid NOT NULL,
    filename text NOT NULL,
    mimetype text NOT NULL,
    data bytea NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: opening_hours; Type: TABLE; Schema: app; Owner: -
--

CREATE TABLE app.opening_hours (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    location_id uuid NOT NULL,
    day_of_week smallint NOT NULL,
    opens_at time without time zone,
    closes_at time without time zone,
    note text,
    is_closed boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT opening_hours_day_range CHECK (((day_of_week >= 0) AND (day_of_week <= 6)))
);


--
-- Name: page; Type: TABLE; Schema: app; Owner: -
--

CREATE TABLE app.page (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    site_id uuid NOT NULL,
    slug text NOT NULL,
    title text NOT NULL,
    meta_description text,
    is_published boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT page_slug_not_empty CHECK ((length(TRIM(BOTH FROM slug)) > 0)),
    CONSTRAINT page_title_not_empty CHECK ((length(TRIM(BOTH FROM title)) > 0))
);


--
-- Name: portfolio_item; Type: TABLE; Schema: app; Owner: -
--

CREATE TABLE app.portfolio_item (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    site_id uuid NOT NULL,
    title text NOT NULL,
    style text NOT NULL,
    image_url text NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    is_published boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    specialist_id uuid,
    CONSTRAINT portfolio_title_not_empty CHECK ((length(TRIM(BOTH FROM title)) > 0))
);


--
-- Name: review; Type: TABLE; Schema: app; Owner: -
--

CREATE TABLE app.review (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    site_id uuid NOT NULL,
    name text NOT NULL,
    rating smallint NOT NULL,
    comment text NOT NULL,
    display_date text,
    status app.review_status DEFAULT 'pending'::app.review_status NOT NULL,
    source text,
    submitted_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT review_name_not_empty CHECK ((length(TRIM(BOTH FROM name)) > 0)),
    CONSTRAINT review_rating_range CHECK (((rating >= 1) AND (rating <= 5)))
);


--
-- Name: site; Type: TABLE; Schema: app; Owner: -
--

CREATE TABLE app.site (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    domain text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT site_name_not_empty CHECK ((length(TRIM(BOTH FROM name)) > 0))
);


--
-- Name: site_link; Type: TABLE; Schema: app; Owner: -
--

CREATE TABLE app.site_link (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    site_id uuid NOT NULL,
    placement app.link_placement NOT NULL,
    label text NOT NULL,
    href text NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    is_primary boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT link_href_not_empty CHECK ((length(TRIM(BOTH FROM href)) > 0)),
    CONSTRAINT link_label_not_empty CHECK ((length(TRIM(BOTH FROM label)) > 0))
);


--
-- Name: social_link; Type: TABLE; Schema: app; Owner: -
--

CREATE TABLE app.social_link (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    site_id uuid NOT NULL,
    platform app.social_platform NOT NULL,
    label text,
    url text NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    is_primary boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT social_url_not_empty CHECK ((length(TRIM(BOTH FROM url)) > 0))
);


--
-- Name: specialist; Type: TABLE; Schema: app; Owner: -
--

CREATE TABLE app.specialist (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    site_id uuid NOT NULL,
    name text NOT NULL,
    specialty text NOT NULL,
    image_url text NOT NULL,
    experience text,
    instagram text,
    whatsapp text,
    sort_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    description text DEFAULT ''::text NOT NULL,
    CONSTRAINT specialist_name_not_empty CHECK ((length(TRIM(BOTH FROM name)) > 0))
);


--
-- Data for Name: contact_info; Type: TABLE DATA; Schema: app; Owner: -
--

COPY app.contact_info (id, site_id, kind, label, value, link_url, sort_order, is_primary, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: contact_submission; Type: TABLE DATA; Schema: app; Owner: -
--

COPY app.contact_submission (id, site_id, name, email, phone, message, status, submitted_at, handled_at, updated_at) FROM stdin;
\.


--
-- Data for Name: course; Type: TABLE DATA; Schema: app; Owner: -
--

COPY app.course (id, site_id, title, description, next_class, price, price_note, created_at, updated_at) FROM stdin;
2fc4fc11-6f3c-4c2b-8f3f-1097c832bfbf	4e0a9f3e-7015-473f-b499-23dce3b3e99f	Curso de Tatuagem	aprenda tudo hoje	50 alunos	10?		2026-05-23 00:19:05.716829+00	2026-05-25 10:24:48.279853+00
\.


--
-- Data for Name: course_enrollment; Type: TABLE DATA; Schema: app; Owner: -
--

COPY app.course_enrollment (id, course_id, name, email, phone, message, status, submitted_at, handled_at, updated_at) FROM stdin;
\.


--
-- Data for Name: course_extra_info; Type: TABLE DATA; Schema: app; Owner: -
--

COPY app.course_extra_info (id, course_id, text, sort_order, created_at) FROM stdin;
\.


--
-- Data for Name: course_feature; Type: TABLE DATA; Schema: app; Owner: -
--

COPY app.course_feature (id, course_id, title, description, sort_order, created_at) FROM stdin;
\.


--
-- Data for Name: course_highlight; Type: TABLE DATA; Schema: app; Owner: -
--

COPY app.course_highlight (id, course_id, text, sort_order, created_at) FROM stdin;
\.


--
-- Data for Name: hero; Type: TABLE DATA; Schema: app; Owner: -
--

COPY app.hero (id, site_id, background_type, background_url, headline, subheadline, cta_primary_label, cta_primary_href, cta_secondary_label, cta_secondary_href, created_at, updated_at) FROM stdin;
55a51467-eb97-4e12-ad84-93a2fb366630	4e0a9f3e-7015-473f-b499-23dce3b3e99f	video	/api/uploads/e4cdd271-34db-4987-ba2e-5b8a1b6a6360	\N	\N	\N	\N	\N	\N	2026-05-23 00:19:05.716829+00	2026-05-25 10:24:48.279853+00
\.


--
-- Data for Name: location; Type: TABLE DATA; Schema: app; Owner: -
--

COPY app.location (id, site_id, name, address_line1, address_line2, city, state, country, postal_code, latitude, longitude, map_embed_url, reference, parking_info, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: opening_hours; Type: TABLE DATA; Schema: app; Owner: -
--

COPY app.opening_hours (id, location_id, day_of_week, opens_at, closes_at, note, is_closed, created_at) FROM stdin;
\.


--
-- Data for Name: page; Type: TABLE DATA; Schema: app; Owner: -
--

COPY app.page (id, site_id, slug, title, meta_description, is_published, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: portfolio_item; Type: TABLE DATA; Schema: app; Owner: -
--

COPY app.portfolio_item (id, site_id, title, style, image_url, sort_order, is_published, created_at, updated_at, specialist_id) FROM stdin;
e1cde605-2cf8-4ca9-a7bf-325295bc11d1	4e0a9f3e-7015-473f-b499-23dce3b3e99f	Tatto	Realismo	/api/uploads/3e76a132-94c5-4be2-8fdb-9cfac5ed80f4	1	t	2026-05-26 14:07:00.528594+00	2026-05-26 14:24:14.552133+00	\N
da6007c2-a2d0-4c7d-8825-38d186d3a319	4e0a9f3e-7015-473f-b499-23dce3b3e99f	Tatto	Realismo	/api/uploads/0a39b17f-86c8-4c6b-8fe9-e2da58d6172d	1	t	2026-05-26 14:24:12.754275+00	2026-05-26 14:24:14.560357+00	\N
fca42cc0-716f-4ffb-8e92-da40843000e5	4e0a9f3e-7015-473f-b499-23dce3b3e99f	Body Piercing	.	/api/uploads/f4c1f99d-4a27-4b04-a47a-5ad3b8cb7114	2	t	2026-05-26 15:02:58.177287+00	2026-05-26 15:02:58.177287+00	55b1c32e-5131-4c45-9e5a-92e7d156f4bc
badeb7a1-8b8a-4e2e-9d23-d7643b56be60	4e0a9f3e-7015-473f-b499-23dce3b3e99f	Body Piercing	.	/api/uploads/99904524-a04a-4595-aec1-003466a39ceb	3	t	2026-05-26 15:02:58.199249+00	2026-05-26 15:02:58.199249+00	55b1c32e-5131-4c45-9e5a-92e7d156f4bc
\.


--
-- Data for Name: review; Type: TABLE DATA; Schema: app; Owner: -
--

COPY app.review (id, site_id, name, rating, comment, display_date, status, source, submitted_at, updated_at) FROM stdin;
\.


--
-- Data for Name: site; Type: TABLE DATA; Schema: app; Owner: -
--

COPY app.site (id, name, domain, created_at, updated_at) FROM stdin;
4e0a9f3e-7015-473f-b499-23dce3b3e99f	Studios Tatto	\N	2026-05-21 16:11:46.190419+00	2026-05-21 16:11:46.190419+00
\.


--
-- Data for Name: site_link; Type: TABLE DATA; Schema: app; Owner: -
--

COPY app.site_link (id, site_id, placement, label, href, sort_order, is_primary, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: social_link; Type: TABLE DATA; Schema: app; Owner: -
--

COPY app.social_link (id, site_id, platform, label, url, sort_order, is_primary, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: specialist; Type: TABLE DATA; Schema: app; Owner: -
--

COPY app.specialist (id, site_id, name, specialty, image_url, experience, instagram, whatsapp, sort_order, is_active, created_at, updated_at, description) FROM stdin;
c69b929c-8c7d-43e0-9be4-bbae02044fdf	4e0a9f3e-7015-473f-b499-23dce3b3e99f	Marcos Santos	Realismo	/api/uploads/9ebcf229-5013-45bf-8508-7091ab0b4e93	+10 anos	@markin_tatuador.	+55 97 98806-3942	0	t	2026-05-25 10:24:48.279853+00	2026-05-25 10:43:27.381219+00	<h2><b>TATUADOR RESIDENTE</b></h2><h2></h2><h3><i style="font-weight: normal;"><span>Conhecido como Markin<br></span>CEO do estudio Markin Tattoo, desenhista e gamer nas horas vagas. Sou um tatuador altamente habilidoso e apaixonado pelo que faço. Com mais de 10 anos de experiencia, desenvolvi um estilo art?stico versatil, tendo como especialidade o REALISMO . Utilizo técnicas refinadas para criar tatuagens unicas e personalizadas. Ao longo da minha carreira , conquistei diversos premios nacionais em convenções de tatuagem e sigo sempre em busca de superar as expectativas de cada cliente.</i></h3>
55b1c32e-5131-4c45-9e5a-92e7d156f4bc	4e0a9f3e-7015-473f-b499-23dce3b3e99f	Mikaella Messa	Body Piercing	/api/uploads/ed725915-df8f-473c-93e6-eba5fa6334a6	ㅤ	@mikaelamessa	+55 27 98806-3942	1	t	2026-05-25 14:10:54.78926+00	2026-05-25 14:10:54.78926+00	<h2 style="font-family: "><i style=""><span style="line-height: 1.15 !important;"><span style="line-height: 1.15 !important;"><span class="citation-86" style="line-height: 1.15 !important;">Conhecida com Mika</span></span></span></i></h2><h3 style="font-family: "><i style="font-weight: normal;"><span style="line-height: 1.15 !important;"><span style="line-height: 1.15 !important;"><span class="citation-86" style="line-height: 1.15 !important;">Capixaba, empreendedora (proprietária do studio), mãe de três filhos e apaixonada pelo que faz.</span></span><span class="citation-86" style="line-height: 1.15 !important;"> </span></span><span style="line-height: 1.15 !important;"><span class="citation-86 citation-end-86" style="line-height: 1.15 !important;"><source-footnote ng-version="0.0.0-PLACEHOLDER" _nghost-ng-c4264493552="" style="line-height: 1.15 !important;"><sup _ngcontent-ng-c4264493552="" class="superscript" style="line-height: 1.15 !important; font-size: 16px !important; background-color: transparent !important;"><!----></sup></source-footnote></span></span><sources-carousel-inline ng-version="0.0.0-PLACEHOLDER" _nghost-ng-c1753633021="" style="line-height: 1.15 !important;">  <br><source-inline-chip _ngcontent-ng-c1753633021="" _nghost-ng-c180289466="" class="ng-star-inserted" style="line-height: 1.15 !important;"><!----><!----><!----><!----><!----></source-inline-chip><!----><!----><!----></sources-carousel-inline></i></h3><h2 style="font-family: "><i style=""><sources-carousel-inline ng-version="0.0.0-PLACEHOLDER" _nghost-ng-c1753633021="" style="line-height: 1.15 !important; font-weight: normal;"><source-inline-chip _ngcontent-ng-c1753633021="" _nghost-ng-c180289466="" class="ng-star-inserted" style="line-height: 1.15 !important;"><!----><!----><!----><!----><!----></source-inline-chip><!----><!----><!----></sources-carousel-inline></i></h2><h3><i style="font-weight: normal;"><span style="line-height: 1.15 !important;"><span style="line-height: 1.15 !important;"><span class="citation-85" style="line-height: 1.15 !important;">Atua como body piercing com dedicação, sensibilidade e profissionalismo, ajudando mulheres e homens a fortalecerem sua autoestima através da arte e da expressão pessoal.</span></span><span class="citation-85" style="line-height: 1.15 !important;"> </span></span><span style="line-height: 1.15 !important;"><span class="citation-85 citation-end-85" style="line-height: 1.15 !important;"><source-footnote ng-version="0.0.0-PLACEHOLDER" _nghost-ng-c4264493552="" style="line-height: 1.15 !important;"><sup _ngcontent-ng-c4264493552="" class="superscript" style="line-height: 1.15 !important; font-size: 16px !important; background-color: transparent !important;"><!----></sup></source-footnote></span></span><sources-carousel-inline ng-version="0.0.0-PLACEHOLDER" _nghost-ng-c1753633021="" style="line-height: 1.15 !important;">  <br><source-inline-chip _ngcontent-ng-c1753633021="" _nghost-ng-c180289466="" class="ng-star-inserted" style="line-height: 1.15 !important;"><!----><!----><!----><!----><!----></source-inline-chip><!----><!----><!----></sources-carousel-inline></i></h3><h3><span style="line-height: 1.15 !important; font-weight: normal;"><i style=""><span style="line-height: 1.15 !important;"><span class="citation-84" style="line-height: 1.15 !important;">Seu trabalho vai além da estética: é sobre acolhimento, confiança e transformação, sempre prezando pela segurança, autenticidade e bem-estar de cada cliente.</span></span><span class="citation-84" style="line-height: 1.15 !important;"> </span></i></span></h3><p id="p-rc_79eef0d9e6fbf707-60" style="font-family: " google="" sans="" text",="" sans-serif="" !important;="" line-height:="" 1.15="" !important;"=""><i style=""><sources-carousel-inline ng-version="0.0.0-PLACEHOLDER" _nghost-ng-c1753633021="" style="line-height: 1.15 !important;"><source-inline-chip _ngcontent-ng-c1753633021="" _nghost-ng-c180289466="" class="ng-star-inserted" style="line-height: 1.15 !important;"><!----><!----><!----><!----><!----></source-inline-chip><!----><!----><!----></sources-carousel-inline></i></p><p style="font-family: " google="" sans="" text",="" sans-serif="" !important;="" line-height:="" 1.15="" !important;"=""><i><span class="citation-85" style="line-height: 1.15 !important;"></span></i></p><p id="p-rc_79eef0d9e6fbf707-61" style="font-family: " google="" sans="" text",="" sans-serif="" !important;="" line-height:="" 1.15="" !important;"=""><i><sources-carousel-inline ng-version="0.0.0-PLACEHOLDER" _nghost-ng-c1753633021="" style="line-height: 1.15 !important;"><source-inline-chip _ngcontent-ng-c1753633021="" _nghost-ng-c180289466="" class="ng-star-inserted" style="line-height: 1.15 !important;"><!----><!----><!----><!----><!----></source-inline-chip><!----><!----><!----></sources-carousel-inline></i></p><p style="font-family: " google="" sans="" text",="" sans-serif="" !important;="" line-height:="" 1.15="" !important;"=""><i><span class="citation-84" style="line-height: 1.15 !important;"></span></i></p>
a0e1701b-7a63-4ba9-8154-570bba829cdd	4e0a9f3e-7015-473f-b499-23dce3b3e99f	Jonathan Rodrigues	Piercing	/api/uploads/19bf8f94-5ad2-4c3d-9b01-d77adaa6e0fd	+ 5 anos	@esquerda	+55 27 9971-4826	2	t	2026-05-25 14:13:59.359012+00	2026-05-25 14:13:59.359012+00	<h2 style="font-family: "><span style="line-height: 1.15 !important;"><span style="line-height: 1.15 !important;"><span class="citation-125" style="line-height: 1.15 !important;">Conhecido como Esquerda</span></span></span></h2><h3 style="font-family: "><span style="font-weight: normal;"><i><span style="line-height: 1.15 !important;"><span style="line-height: 1.15 !important;"><span class="citation-125" style="line-height: 1.15 !important;">Sou apaixonado por esportes e acredito que disciplina e dedicação fazem toda diferença.</span></span><span class="citation-125" style="line-height: 1.15 !important;"> </span></span><span style="line-height: 1.15 !important;"><span class="citation-125 citation-end-125" style="line-height: 1.15 !important;"><source-footnote ng-version="0.0.0-PLACEHOLDER" _nghost-ng-c4264493552="" style="line-height: 1.15 !important;"><sup _ngcontent-ng-c4264493552="" class="superscript" style="line-height: 1.15 !important; font-size: 16px !important; background-color: transparent !important;"><!----></sup></source-footnote></span></span><sources-carousel-inline ng-version="0.0.0-PLACEHOLDER" _nghost-ng-c1753633021="" style="line-height: 1.15 !important;">  <br><source-inline-chip _ngcontent-ng-c1753633021="" _nghost-ng-c180289466="" class="ng-star-inserted" style="line-height: 1.15 !important;"><!----><!----><!----><!----><!----></source-inline-chip><!----><!----><!----></sources-carousel-inline></i><i><span style="line-height: 1.15 !important;"><span style="line-height: 1.15 !important;"><span class="citation-124" style="line-height: 1.15 !important;">Sou uma pessoa atenciosa, sempre buscando tratar todos com respeito e dar o meu melhor em tudo que faço.</span></span><span class="citation-124" style="line-height: 1.15 !important;"> </span></span><span style="line-height: 1.15 !important;"><span class="citation-124 citation-end-124" style="line-height: 1.15 !important;"><source-footnote ng-version="0.0.0-PLACEHOLDER" _nghost-ng-c4264493552="" style="line-height: 1.15 !important;"><sup _ngcontent-ng-c4264493552="" class="superscript" style="line-height: 1.15 !important; font-size: 16px !important; background-color: transparent !important;"><!----></sup></source-footnote></span></span><sources-carousel-inline ng-version="0.0.0-PLACEHOLDER" _nghost-ng-c1753633021="" style="line-height: 1.15 !important;">  <br><source-inline-chip _ngcontent-ng-c1753633021="" _nghost-ng-c180289466="" class="ng-star-inserted" style="line-height: 1.15 !important;"><!----><!----><!----><!----><!----></source-inline-chip><!----><!----><!----></sources-carousel-inline></i><i><span style="line-height: 1.15 !important;"><span style="line-height: 1.15 !important;"><span class="citation-123" style="line-height: 1.15 !important;">Atuo na área de piercings a mais de 5 anos, realizando perfurações básicas com muito cuidado, higiene e atenção aos detalhes, sempre focando em proporcionar uma boa experiência para cada cliente.</span></span><span class="citation-123" style="line-height: 1.15 !important;"> </span></span><span style="line-height: 1.15 !important;"><span class="citation-123 citation-end-123" style="line-height: 1.15 !important;"><source-footnote ng-version="0.0.0-PLACEHOLDER" _nghost-ng-c4264493552="" style="line-height: 1.15 !important;"><sup _ngcontent-ng-c4264493552="" class="superscript" style="line-height: 1.15 !important; font-size: 16px !important; background-color: transparent !important;"><!----></sup></source-footnote></span></span><sources-carousel-inline ng-version="0.0.0-PLACEHOLDER" _nghost-ng-c1753633021="" style="line-height: 1.15 !important;">  <br><source-inline-chip _ngcontent-ng-c1753633021="" _nghost-ng-c180289466="" class="ng-star-inserted" style="line-height: 1.15 !important;"><!----><!----><!----><!----><!----></source-inline-chip><!----><!----><!----></sources-carousel-inline></i><span style="line-height: 1.15 !important;"><span style="line-height: 1.15 !important;"><i>Estou em constante evolução, buscando crescer profissionalmente e me destacar cada vez mais na minha área.</i></span></span></span></h3><p id="p-rc_2863df2ba8c22ba4-82" style="font-family: " google="" sans="" text",="" sans-serif="" !important;="" line-height:="" 1.15="" !important;"=""><i><sources-carousel-inline ng-version="0.0.0-PLACEHOLDER" _nghost-ng-c1753633021="" style="line-height: 1.15 !important;"><source-inline-chip _ngcontent-ng-c1753633021="" _nghost-ng-c180289466="" class="ng-star-inserted" style="line-height: 1.15 !important;"><!----><!----><!----><!----><!----></source-inline-chip><!----><!----><!----></sources-carousel-inline></i></p><p style="font-family: " google="" sans="" text",="" sans-serif="" !important;="" line-height:="" 1.15="" !important;"=""><i><span class="citation-124" style="line-height: 1.15 !important;"></span></i></p><p id="p-rc_2863df2ba8c22ba4-83" style="font-family: " google="" sans="" text",="" sans-serif="" !important;="" line-height:="" 1.15="" !important;"=""><i><sources-carousel-inline ng-version="0.0.0-PLACEHOLDER" _nghost-ng-c1753633021="" style="line-height: 1.15 !important;"><source-inline-chip _ngcontent-ng-c1753633021="" _nghost-ng-c180289466="" class="ng-star-inserted" style="line-height: 1.15 !important;"><!----><!----><!----><!----><!----></source-inline-chip><!----><!----><!----></sources-carousel-inline></i></p><p style="font-family: " google="" sans="" text",="" sans-serif="" !important;="" line-height:="" 1.15="" !important;"=""><i><span class="citation-123" style="line-height: 1.15 !important;"></span></i></p><p id="p-rc_2863df2ba8c22ba4-84" style="font-family: " google="" sans="" text",="" sans-serif="" !important;="" line-height:="" 1.15="" !important;"=""><i><sources-carousel-inline ng-version="0.0.0-PLACEHOLDER" _nghost-ng-c1753633021="" style="line-height: 1.15 !important;"><source-inline-chip _ngcontent-ng-c1753633021="" _nghost-ng-c180289466="" class="ng-star-inserted" style="line-height: 1.15 !important;"><!----><!----><!----><!----><!----></source-inline-chip><!----><!----><!----></sources-carousel-inline></i></p><p style="font-family: " google="" sans="" text",="" sans-serif="" !important;="" line-height:="" 1.15="" !important;"=""><i><span class="citation-122" style="line-height: 1.15 !important;"></span></i></p>
\.


--
-- Name: contact_info contact_info_pkey; Type: CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.contact_info
    ADD CONSTRAINT contact_info_pkey PRIMARY KEY (id);


--
-- Name: contact_submission contact_submission_pkey; Type: CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.contact_submission
    ADD CONSTRAINT contact_submission_pkey PRIMARY KEY (id);


--
-- Name: course_enrollment course_enrollment_pkey; Type: CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.course_enrollment
    ADD CONSTRAINT course_enrollment_pkey PRIMARY KEY (id);


--
-- Name: course_extra_info course_extra_info_pkey; Type: CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.course_extra_info
    ADD CONSTRAINT course_extra_info_pkey PRIMARY KEY (id);


--
-- Name: course_feature course_feature_pkey; Type: CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.course_feature
    ADD CONSTRAINT course_feature_pkey PRIMARY KEY (id);


--
-- Name: course_highlight course_highlight_pkey; Type: CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.course_highlight
    ADD CONSTRAINT course_highlight_pkey PRIMARY KEY (id);


--
-- Name: course course_pkey; Type: CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.course
    ADD CONSTRAINT course_pkey PRIMARY KEY (id);


--
-- Name: course course_site_unique; Type: CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.course
    ADD CONSTRAINT course_site_unique UNIQUE (site_id);


--
-- Name: hero hero_pkey; Type: CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.hero
    ADD CONSTRAINT hero_pkey PRIMARY KEY (id);


--
-- Name: hero hero_site_unique; Type: CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.hero
    ADD CONSTRAINT hero_site_unique UNIQUE (site_id);


--
-- Name: location location_pkey; Type: CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.location
    ADD CONSTRAINT location_pkey PRIMARY KEY (id);


--
-- Name: media_asset media_asset_pkey; Type: CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.media_asset
    ADD CONSTRAINT media_asset_pkey PRIMARY KEY (id);


--
-- Name: opening_hours opening_hours_pkey; Type: CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.opening_hours
    ADD CONSTRAINT opening_hours_pkey PRIMARY KEY (id);


--
-- Name: opening_hours opening_hours_unique_day; Type: CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.opening_hours
    ADD CONSTRAINT opening_hours_unique_day UNIQUE (location_id, day_of_week);


--
-- Name: page page_pkey; Type: CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.page
    ADD CONSTRAINT page_pkey PRIMARY KEY (id);


--
-- Name: page page_site_slug_unique; Type: CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.page
    ADD CONSTRAINT page_site_slug_unique UNIQUE (site_id, slug);


--
-- Name: portfolio_item portfolio_item_pkey; Type: CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.portfolio_item
    ADD CONSTRAINT portfolio_item_pkey PRIMARY KEY (id);


--
-- Name: review review_pkey; Type: CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.review
    ADD CONSTRAINT review_pkey PRIMARY KEY (id);


--
-- Name: site_link site_link_pkey; Type: CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.site_link
    ADD CONSTRAINT site_link_pkey PRIMARY KEY (id);


--
-- Name: site site_pkey; Type: CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.site
    ADD CONSTRAINT site_pkey PRIMARY KEY (id);


--
-- Name: social_link social_link_pkey; Type: CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.social_link
    ADD CONSTRAINT social_link_pkey PRIMARY KEY (id);


--
-- Name: specialist specialist_pkey; Type: CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.specialist
    ADD CONSTRAINT specialist_pkey PRIMARY KEY (id);


--
-- Name: contact_info_idx; Type: INDEX; Schema: app; Owner: -
--

CREATE INDEX contact_info_idx ON app.contact_info USING btree (site_id, sort_order);


--
-- Name: contact_info_site_kind_idx; Type: INDEX; Schema: app; Owner: -
--

CREATE INDEX contact_info_site_kind_idx ON app.contact_info USING btree (site_id, kind, sort_order);


--
-- Name: contact_submission_site_status_idx; Type: INDEX; Schema: app; Owner: -
--

CREATE INDEX contact_submission_site_status_idx ON app.contact_submission USING btree (site_id, status, submitted_at DESC);


--
-- Name: course_enrollment_course_status_idx; Type: INDEX; Schema: app; Owner: -
--

CREATE INDEX course_enrollment_course_status_idx ON app.course_enrollment USING btree (course_id, status, submitted_at DESC);


--
-- Name: course_extra_course_idx; Type: INDEX; Schema: app; Owner: -
--

CREATE INDEX course_extra_course_idx ON app.course_extra_info USING btree (course_id, sort_order);


--
-- Name: course_extra_info_idx; Type: INDEX; Schema: app; Owner: -
--

CREATE INDEX course_extra_info_idx ON app.course_extra_info USING btree (course_id, sort_order);


--
-- Name: course_feature_course_idx; Type: INDEX; Schema: app; Owner: -
--

CREATE INDEX course_feature_course_idx ON app.course_feature USING btree (course_id, sort_order);


--
-- Name: course_feature_idx; Type: INDEX; Schema: app; Owner: -
--

CREATE INDEX course_feature_idx ON app.course_feature USING btree (course_id, sort_order);


--
-- Name: course_highlight_course_idx; Type: INDEX; Schema: app; Owner: -
--

CREATE INDEX course_highlight_course_idx ON app.course_highlight USING btree (course_id, sort_order);


--
-- Name: course_highlight_idx; Type: INDEX; Schema: app; Owner: -
--

CREATE INDEX course_highlight_idx ON app.course_highlight USING btree (course_id, sort_order);


--
-- Name: course_site_idx; Type: INDEX; Schema: app; Owner: -
--

CREATE INDEX course_site_idx ON app.course USING btree (site_id);


--
-- Name: hero_site_idx; Type: INDEX; Schema: app; Owner: -
--

CREATE INDEX hero_site_idx ON app.hero USING btree (site_id);


--
-- Name: idx_course_extra_info_course_id; Type: INDEX; Schema: app; Owner: -
--

CREATE INDEX idx_course_extra_info_course_id ON app.course_extra_info USING btree (course_id);


--
-- Name: idx_course_site_id; Type: INDEX; Schema: app; Owner: -
--

CREATE INDEX idx_course_site_id ON app.course USING btree (site_id);


--
-- Name: location_site_idx; Type: INDEX; Schema: app; Owner: -
--

CREATE INDEX location_site_idx ON app.location USING btree (site_id);


--
-- Name: media_asset_site_idx; Type: INDEX; Schema: app; Owner: -
--

CREATE INDEX media_asset_site_idx ON app.media_asset USING btree (site_id, created_at DESC);


--
-- Name: opening_hours_location_idx; Type: INDEX; Schema: app; Owner: -
--

CREATE INDEX opening_hours_location_idx ON app.opening_hours USING btree (location_id, day_of_week);


--
-- Name: portfolio_site_idx; Type: INDEX; Schema: app; Owner: -
--

CREATE INDEX portfolio_site_idx ON app.portfolio_item USING btree (site_id, sort_order);


--
-- Name: review_site_status_idx; Type: INDEX; Schema: app; Owner: -
--

CREATE INDEX review_site_status_idx ON app.review USING btree (site_id, status, submitted_at DESC);


--
-- Name: site_link_idx; Type: INDEX; Schema: app; Owner: -
--

CREATE INDEX site_link_idx ON app.site_link USING btree (site_id, placement, sort_order);


--
-- Name: site_link_site_placement_idx; Type: INDEX; Schema: app; Owner: -
--

CREATE INDEX site_link_site_placement_idx ON app.site_link USING btree (site_id, placement, sort_order);


--
-- Name: site_page_site_idx; Type: INDEX; Schema: app; Owner: -
--

CREATE INDEX site_page_site_idx ON app.page USING btree (site_id);


--
-- Name: social_link_idx; Type: INDEX; Schema: app; Owner: -
--

CREATE INDEX social_link_idx ON app.social_link USING btree (site_id, sort_order);


--
-- Name: social_link_site_platform_idx; Type: INDEX; Schema: app; Owner: -
--

CREATE INDEX social_link_site_platform_idx ON app.social_link USING btree (site_id, platform, sort_order);


--
-- Name: specialist_site_idx; Type: INDEX; Schema: app; Owner: -
--

CREATE INDEX specialist_site_idx ON app.specialist USING btree (site_id, sort_order);


--
-- Name: course course_update_timestamp; Type: TRIGGER; Schema: app; Owner: -
--

CREATE TRIGGER course_update_timestamp BEFORE UPDATE ON app.course FOR EACH ROW EXECUTE FUNCTION app.update_course_timestamp();


--
-- Name: contact_info set_updated_at_contact_info; Type: TRIGGER; Schema: app; Owner: -
--

CREATE TRIGGER set_updated_at_contact_info BEFORE UPDATE ON app.contact_info FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();


--
-- Name: contact_submission set_updated_at_contact_submission; Type: TRIGGER; Schema: app; Owner: -
--

CREATE TRIGGER set_updated_at_contact_submission BEFORE UPDATE ON app.contact_submission FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();


--
-- Name: course set_updated_at_course; Type: TRIGGER; Schema: app; Owner: -
--

CREATE TRIGGER set_updated_at_course BEFORE UPDATE ON app.course FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();


--
-- Name: course_enrollment set_updated_at_course_enrollment; Type: TRIGGER; Schema: app; Owner: -
--

CREATE TRIGGER set_updated_at_course_enrollment BEFORE UPDATE ON app.course_enrollment FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();


--
-- Name: hero set_updated_at_hero; Type: TRIGGER; Schema: app; Owner: -
--

CREATE TRIGGER set_updated_at_hero BEFORE UPDATE ON app.hero FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();


--
-- Name: location set_updated_at_location; Type: TRIGGER; Schema: app; Owner: -
--

CREATE TRIGGER set_updated_at_location BEFORE UPDATE ON app.location FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();


--
-- Name: page set_updated_at_page; Type: TRIGGER; Schema: app; Owner: -
--

CREATE TRIGGER set_updated_at_page BEFORE UPDATE ON app.page FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();


--
-- Name: portfolio_item set_updated_at_portfolio_item; Type: TRIGGER; Schema: app; Owner: -
--

CREATE TRIGGER set_updated_at_portfolio_item BEFORE UPDATE ON app.portfolio_item FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();


--
-- Name: review set_updated_at_review; Type: TRIGGER; Schema: app; Owner: -
--

CREATE TRIGGER set_updated_at_review BEFORE UPDATE ON app.review FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();


--
-- Name: site set_updated_at_site; Type: TRIGGER; Schema: app; Owner: -
--

CREATE TRIGGER set_updated_at_site BEFORE UPDATE ON app.site FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();


--
-- Name: site_link set_updated_at_site_link; Type: TRIGGER; Schema: app; Owner: -
--

CREATE TRIGGER set_updated_at_site_link BEFORE UPDATE ON app.site_link FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();


--
-- Name: social_link set_updated_at_social_link; Type: TRIGGER; Schema: app; Owner: -
--

CREATE TRIGGER set_updated_at_social_link BEFORE UPDATE ON app.social_link FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();


--
-- Name: specialist set_updated_at_specialist; Type: TRIGGER; Schema: app; Owner: -
--

CREATE TRIGGER set_updated_at_specialist BEFORE UPDATE ON app.specialist FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();


--
-- Name: contact_info contact_info_site_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.contact_info
    ADD CONSTRAINT contact_info_site_id_fkey FOREIGN KEY (site_id) REFERENCES app.site(id) ON DELETE CASCADE;


--
-- Name: contact_submission contact_submission_site_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.contact_submission
    ADD CONSTRAINT contact_submission_site_id_fkey FOREIGN KEY (site_id) REFERENCES app.site(id) ON DELETE CASCADE;


--
-- Name: course_enrollment course_enrollment_course_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.course_enrollment
    ADD CONSTRAINT course_enrollment_course_id_fkey FOREIGN KEY (course_id) REFERENCES app.course(id) ON DELETE CASCADE;


--
-- Name: course_extra_info course_extra_info_course_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.course_extra_info
    ADD CONSTRAINT course_extra_info_course_id_fkey FOREIGN KEY (course_id) REFERENCES app.course(id) ON DELETE CASCADE;


--
-- Name: course_feature course_feature_course_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.course_feature
    ADD CONSTRAINT course_feature_course_id_fkey FOREIGN KEY (course_id) REFERENCES app.course(id) ON DELETE CASCADE;


--
-- Name: course_highlight course_highlight_course_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.course_highlight
    ADD CONSTRAINT course_highlight_course_id_fkey FOREIGN KEY (course_id) REFERENCES app.course(id) ON DELETE CASCADE;


--
-- Name: course course_site_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.course
    ADD CONSTRAINT course_site_id_fkey FOREIGN KEY (site_id) REFERENCES app.site(id) ON DELETE CASCADE;


--
-- Name: hero hero_site_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.hero
    ADD CONSTRAINT hero_site_id_fkey FOREIGN KEY (site_id) REFERENCES app.site(id) ON DELETE CASCADE;


--
-- Name: location location_site_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.location
    ADD CONSTRAINT location_site_id_fkey FOREIGN KEY (site_id) REFERENCES app.site(id) ON DELETE CASCADE;


--
-- Name: media_asset media_asset_site_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.media_asset
    ADD CONSTRAINT media_asset_site_id_fkey FOREIGN KEY (site_id) REFERENCES app.site(id) ON DELETE CASCADE;


--
-- Name: opening_hours opening_hours_location_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.opening_hours
    ADD CONSTRAINT opening_hours_location_id_fkey FOREIGN KEY (location_id) REFERENCES app.location(id) ON DELETE CASCADE;


--
-- Name: page page_site_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.page
    ADD CONSTRAINT page_site_id_fkey FOREIGN KEY (site_id) REFERENCES app.site(id) ON DELETE CASCADE;


--
-- Name: portfolio_item portfolio_item_site_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.portfolio_item
    ADD CONSTRAINT portfolio_item_site_id_fkey FOREIGN KEY (site_id) REFERENCES app.site(id) ON DELETE CASCADE;


--
-- Name: portfolio_item portfolio_item_specialist_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.portfolio_item
    ADD CONSTRAINT portfolio_item_specialist_id_fkey FOREIGN KEY (specialist_id) REFERENCES app.specialist(id);


--
-- Name: review review_site_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.review
    ADD CONSTRAINT review_site_id_fkey FOREIGN KEY (site_id) REFERENCES app.site(id) ON DELETE CASCADE;


--
-- Name: site_link site_link_site_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.site_link
    ADD CONSTRAINT site_link_site_id_fkey FOREIGN KEY (site_id) REFERENCES app.site(id) ON DELETE CASCADE;


--
-- Name: social_link social_link_site_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.social_link
    ADD CONSTRAINT social_link_site_id_fkey FOREIGN KEY (site_id) REFERENCES app.site(id) ON DELETE CASCADE;


--
-- Name: specialist specialist_site_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY app.specialist
    ADD CONSTRAINT specialist_site_id_fkey FOREIGN KEY (site_id) REFERENCES app.site(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict wE0JjcYLcd9kgLLSqNByd7aJz9eDS4E5ElWaUjiCAwbtQFpm4c0F08hXbVPwv7h

