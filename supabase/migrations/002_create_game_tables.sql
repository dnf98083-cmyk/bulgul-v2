-- ============================================================
-- 캐릭터 테이블
-- ============================================================
CREATE TABLE IF NOT EXISTS characters (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name       text NOT NULL UNIQUE,
  category   text NOT NULL DEFAULT 'hero', -- hero, pet
  type       text,                          -- 공격형, 방어형, 마법형, 지원형, 만능형
  created_at timestamptz DEFAULT now()
);

ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "로그인한 사용자 조회" ON characters FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "관리자 수정" ON characters FOR ALL USING (true); -- 서비스 롤에서 제어

-- ============================================================
-- 방어팀 테이블 (길드전)
-- ============================================================
CREATE TABLE IF NOT EXISTS defense_teams (
  id         text PRIMARY KEY, -- Firebase push key 유지
  name       text NOT NULL,
  order_idx  int  DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE defense_teams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "로그인한 사용자 조회" ON defense_teams FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "관리자 수정" ON defense_teams FOR ALL USING (true);

-- ============================================================
-- 공격팀 테이블 (방어팀별 공략)
-- ============================================================
CREATE TABLE IF NOT EXISTS attack_teams (
  id              text PRIMARY KEY, -- Firebase push key 유지
  defense_team_id text REFERENCES defense_teams(id) ON DELETE CASCADE,
  name            text,
  characters      text[]  DEFAULT '{}',
  formation       text,
  type            text,    -- 확실한 승, 내줘도 됨, 위험, 등
  ring            text,
  skill           text,
  pet             text,
  armor           text,    -- 장갑 세팅 정보
  win             int DEFAULT 0,
  lose            int DEFAULT 0,
  created_at      timestamptz DEFAULT now()
);

ALTER TABLE attack_teams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "로그인한 사용자 조회" ON attack_teams FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "관리자 수정" ON attack_teams FOR ALL USING (true);

-- ============================================================
-- 공지사항 테이블
-- ============================================================
CREATE TABLE IF NOT EXISTS notices (
  id         text PRIMARY KEY, -- Firebase push key 유지
  title      text NOT NULL,
  body       text NOT NULL,
  author     text NOT NULL,
  date       text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "로그인한 사용자 조회" ON notices FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "관리자 수정" ON notices FOR ALL USING (true);

-- ============================================================
-- 공지 읽음 테이블
-- ============================================================
CREATE TABLE IF NOT EXISTS notice_reads (
  notice_id text REFERENCES notices(id) ON DELETE CASCADE,
  nickname  text NOT NULL,
  PRIMARY KEY (notice_id, nickname)
);

ALTER TABLE notice_reads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "본인 읽음 조회" ON notice_reads FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "관리자 수정" ON notice_reads FOR ALL USING (true);

-- ============================================================
-- 오늘의 길드전 테이블
-- ============================================================
CREATE TABLE IF NOT EXISTS today_guild_war (
  id         int DEFAULT 1 PRIMARY KEY CHECK (id = 1), -- 항상 1개만
  date       text,
  data       jsonb DEFAULT '{}'
);

ALTER TABLE today_guild_war ENABLE ROW LEVEL SECURITY;
CREATE POLICY "로그인한 사용자 조회" ON today_guild_war FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "관리자 수정" ON today_guild_war FOR ALL USING (true);

-- ============================================================
-- PVE 점수 테이블 (공성전, 파괴신)
-- ============================================================
CREATE TABLE IF NOT EXISTS pve_scores (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  type       text NOT NULL, -- 'siege' | 'advent'
  key        text NOT NULL, -- 요일(월화수...) 또는 보스명
  season     text NOT NULL, -- 'this' | 'last'
  nickname   text NOT NULL,
  score      bigint,
  date       text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE pve_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "로그인한 사용자 조회" ON pve_scores FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "관리자 수정" ON pve_scores FOR ALL USING (true);

-- ============================================================
-- 덱편성 테이블
-- ============================================================
CREATE TABLE IF NOT EXISTS deck_plans (
  nickname   text PRIMARY KEY,
  teams      jsonb DEFAULT '[]',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE deck_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "로그인한 사용자 조회" ON deck_plans FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "관리자 수정" ON deck_plans FOR ALL USING (true);

-- ============================================================
-- 총력전 팀편성 테이블
-- ============================================================
CREATE TABLE IF NOT EXISTS totalwar_teams (
  nickname   text PRIMARY KEY,
  data       jsonb DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE totalwar_teams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "로그인한 사용자 조회" ON totalwar_teams FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "관리자 수정" ON totalwar_teams FOR ALL USING (true);

-- ============================================================
-- PVE 빌드 테이블
-- ============================================================
CREATE TABLE IF NOT EXISTS pve_builds (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  category   text NOT NULL, -- 'advent' | 'siege'
  key        text NOT NULL, -- 보스명 또는 스테이지
  sub_key    text,          -- 난이도 등
  data       jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE pve_builds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "로그인한 사용자 조회" ON pve_builds FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "관리자 수정" ON pve_builds FOR ALL USING (true);
