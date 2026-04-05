// DOGWALKPOOPOO — Editorial Source Lists
//
// 각 에디터가 보는 소스들. 선정 기준:
// - 메인스트림 아님 (NYT Arts, Pitchfork 메인 등 제외)
// - 해당 분야 내에서 비교적 덜 알려진 구석을 다루는 곳
// - 아카이브성이 있어서 오래된 것도 건질 수 있는 곳
// - 영상/사운드/이미지 원본에 가까운 곳

export const SOURCES = {
  film: {
    description: 'Film & Moving Image',
    primary: [
      { name: 'MUBI Notebook',        url: 'https://mubi.com/en/notebook',                  note: '에세이 + 비평. 비주류 시네마 중심.' },
      { name: 'Vimeo Staff Picks',    url: 'https://vimeo.com/channels/staffpicks',          note: '단편 영상. 알려지지 않은 감독들.' },
      { name: 'Short of the Week',    url: 'https://www.shortoftheweek.com',                 note: '단편 영화 큐레이션. 무료 시청 가능.' },
      { name: 'Criterion Essay',      url: 'https://www.criterion.com/current',              note: '에세이보다 스틸 컷과 제작 사진 위주로 볼 것.' },
      { name: 'Cinema Guild',         url: 'https://cinemaguild.com',                        note: '배급사. 배급 목록에서 잘 안 알려진 작품 탐색.' },
    ],
    secondary: [
      { name: 'Fandor',               url: 'https://www.fandor.com',                         note: '인디 + 실험 영화 스트리밍.' },
      { name: 'Kinoscope',            url: 'https://kinoscope.org',                          note: '아트하우스 단편 무료 공개.' },
      { name: 'The Film Stage',       url: 'https://thefilmstage.com',                       note: '인터뷰에서 감독들이 언급하는 영향작 찾기.' },
    ],
    searchQueries: [
      'overlooked cinematography single shot',
      'accidental beauty film frame analysis',
      'B-roll that outlived its film',
      'experimental short film texture',
    ]
  },

  'contemporary-art': {
    description: 'Contemporary Art',
    primary: [
      { name: 'e-flux',               url: 'https://www.e-flux.com/journal',                 note: '이론 무거움. 전시 공지보다 아카이브에서 작가 찾기.' },
      { name: '4Columns',             url: 'https://www.4columns.org',                       note: '비평. 주류 아트 월드 주변부 다룸.' },
      { name: 'The White Review',     url: 'https://www.thewhitereview.org',                 note: '문학+미술 교차. 인터뷰에서 작가가 언급하는 다른 작가들.' },
      { name: 'DIS Magazine (archive)',url: 'https://dismagazine.com',                        note: '활동 중단. 하지만 아카이브가 보물창고.' },
      { name: 'Rhizome',              url: 'https://rhizome.org',                            note: '넷아트 + 디지털 아트. 거의 아무도 안 봄.' },
    ],
    secondary: [
      { name: 'Cabinet Magazine',     url: 'https://www.cabinetmagazine.org',                note: '아트+아이디어의 이상한 교차점.' },
      { name: 'Mousse Magazine',      url: 'https://www.moussemagazine.it',                  note: '유럽 컨템포러리. 인터뷰.' },
      { name: 'Art Viewer',           url: 'https://artviewer.org',                          note: '전시 설치 사진 아카이브. 설명 없이 이미지만.' },
    ],
    searchQueries: [
      'installation art documentation wrong angle',
      'artist studio process unseen',
      'contemporary art shipping crate beautiful',
      'performance art empty space after',
    ]
  },

  architecture: {
    description: 'Architecture & Space',
    primary: [
      { name: 'Failed Architecture',  url: 'https://failedarchitecture.com',                 note: '실패한 건축, 버려진 공간. 플랫폼 감수성과 가장 가까움.' },
      { name: 'Places Journal',       url: 'https://placesjournal.org',                      note: '공간에 관한 깊은 에세이. 비주류 주제 많음.' },
      { name: 'Domus',                url: 'https://www.domusweb.it/en/architecture',         note: '유러피안 건축. 덜 알려진 프로젝트 섹션.' },
      { name: 'Architectural Review', url: 'https://www.architectural-review.com',            note: '비평적 텍스트. 수상작보다 논쟁작.' },
      { name: 'Atlas Obscura',        url: 'https://www.atlasobscura.com',                   note: '이상한 공간들. 검색: architectural, brutalism, forgotten.' },
    ],
    secondary: [
      { name: 'Storefront NYC',       url: 'https://storefrontnews.org',                     note: '실험적 건축 프로젝트 아카이브.' },
      { name: 'Log (magazine)',        url: 'https://www.anycorp.com/log',                   note: '건축 이론. 비주류.' },
      { name: 'Dezeen (brutalism)',   url: 'https://www.dezeen.com/tag/brutalism',            note: '브루탈리즘 태그만. 메인은 너무 mainstream.' },
    ],
    searchQueries: [
      'unfinished building beautiful light',
      'brutalist parking structure unexpected',
      'infrastructure beauty accidental colonnade',
      'service corridor forgotten architecture',
    ]
  },

  object: {
    description: 'Object & Fashion',
    primary: [
      { name: 'Disegno Journal',      url: 'https://www.disegnojournal.com',                 note: '디자인 비평. 오브젝트를 진지하게 다룸.' },
      { name: 'Things Magazine',      url: 'http://thingsmagazine.net',                      note: '오브젝트 문화 에세이. 소규모 발행.' },
      { name: 'System Magazine',      url: 'https://system-magazine.com',                    note: '패션 이론. 인터뷰 중심.' },
      { name: 'SSENSE Editorial',     url: 'https://www.ssense.com/en-us/editorial',         note: '패션+아트 교차. 에디토리얼 퀄리티 높음.' },
      { name: 'Vestoj',               url: 'http://vestoj.com',                              note: '패션 저널. 학술적이지만 감각적. 아카이브 풍부.' },
    ],
    secondary: [
      { name: 'AnOther Magazine',     url: 'https://www.anothermag.com',                     note: '패션+아트. 아카이브에서 오래된 에디토리얼.' },
      { name: '032c',                 url: 'https://032c.com',                               note: '베를린 기반. 패션+문화+아이디어.' },
      { name: 'Inventory Magazine',   url: 'https://inventorymagazine.com',                  note: '오브젝트+장인정신. 느린 감각.' },
    ],
    searchQueries: [
      'industrial tool unexpected beauty form',
      'fashion worn wrong beautiful',
      'packaging empty beautiful object',
      'mass produced object better than premium',
    ]
  },

  nature: {
    description: 'Nature & Environment',
    primary: [
      { name: 'Emergence Magazine',   url: 'https://emergencemagazine.org',                  note: '생태+문학. 비주류 자연 감각.' },
      { name: 'Hakai Magazine',       url: 'https://hakaimagazine.com',                      note: '해안+해양 생태. 과학적이지만 아름다움.' },
      { name: 'Terrain.org',          url: 'https://terrain.org',                            note: '환경 문학+에세이. 도시 자연 많이 다룸.' },
      { name: 'Places Journal',       url: 'https://placesjournal.org',                      note: '랜드스케이프+환경. 건축과 겹치지만 다른 각도.' },
      { name: 'Orion Magazine',       url: 'https://orionmagazine.org',                      note: '자연+문화 교차. 일반적인 자연 잡지 아님.' },
    ],
    secondary: [
      { name: 'Edge of Humanity',     url: 'https://edgeofhumanity.com/nature',              note: '도큐멘터리 사진. 인간과 자연 경계.' },
      { name: 'Dark Mountain',        url: 'https://dark-mountain.net',                      note: '문명 붕괴 이후 자연 상상. 비주류 생태 사상.' },
      { name: 'Robin Wall Kimmerer',  url: 'https://robinwallkimmerer.com',                  note: '식물학자. 과학+시. 그의 언급 작가들 따라가기.' },
    ],
    searchQueries: [
      'urban nature invasive species beautiful',
      'lichen concrete wall texture',
      'industrial zone nature reclaiming',
      'weather phenomenon overlooked beautiful',
    ]
  },

  sound: {
    description: 'Sound & Music',
    primary: [
      { name: 'The Wire',             url: 'https://www.thewire.co.uk',                      note: '실험음악+노이즈+필드레코딩 전문지. 핵심 소스.' },
      { name: 'Bandcamp Daily',       url: 'https://daily.bandcamp.com',                     note: '인디 음악. 장르별 깊은 발굴.' },
      { name: 'Fact Magazine',        url: 'https://www.factmag.com',                        note: '일렉트로닉+실험. 아카이브 풍부.' },
      { name: 'Quietus',              url: 'https://thequietus.com',                         note: '음악 비평. 비주류 포커스.' },
      { name: 'Free Music Archive',   url: 'https://freemusicarchive.org',                   note: '라이선스 프리 음악. 이상한 것들 많음.' },
    ],
    secondary: [
      { name: 'Phonography.org',      url: 'https://phonography.org',                        note: '필드 레코딩 커뮤니티. 특정 공간 소리 아카이브.' },
      { name: 'SoundCloud (ambient)', url: 'https://soundcloud.com/tags/field-recording',    note: '필드 레코딩 태그. 아무도 안 듣는 것들.' },
      { name: 'Discogs (obscure)',    url: 'https://www.discogs.com/search/?style=Musique+Concrète', note: '뮤지크 콩크레트. 희귀 레코드.' },
      { name: 'UbuWeb Sound',         url: 'https://www.ubu.com/sound',                      note: '실험음악 아카이브. 전설적인 소스.' },
    ],
    searchQueries: [
      'field recording accidental harmony',
      'infrastructure sound unintentional music',
      'HVAC drone acoustic phenomenon',
      'subway station natural reverb',
    ]
  }
};

// 각 에디터가 실제 서치에 쓸 쿼리 생성
export function buildSearchQueries(category) {
  const src = SOURCES[category];
  if (!src) return [];

  const siteSearches = src.primary
    .slice(0, 3)
    .map(s => `site:${new URL(s.url).hostname}`);

  return [
    ...src.searchQueries,
    ...siteSearches,
  ];
}

// primary + secondary 합쳐서 반환
export function getSourceList(category) {
  const src = SOURCES[category];
  if (!src) return [];
  return [...src.primary, ...(src.secondary || [])];
}
