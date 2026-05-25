CREATE TABLE users (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nickname   text NOT NULL UNIQUE,
  entry_code char(6) NOT NULL,
  role       text NOT NULL DEFAULT '일반' CHECK (role IN ('일반', '연구원', '관리자')),
  created_at timestamptz DEFAULT now()
);
