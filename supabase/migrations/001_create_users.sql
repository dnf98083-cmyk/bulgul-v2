CREATE TABLE users (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nickname   text NOT NULL UNIQUE,
  entry_code char(6) NOT NULL,
  role       text NOT NULL DEFAULT '일반' CHECK (role IN ('일반', '연구원', '관리자')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "로그인한 사용자는 조회 가능"
  ON users FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "닉네임 목록은 누구나 조회 가능"
  ON users FOR SELECT
  USING (true);
