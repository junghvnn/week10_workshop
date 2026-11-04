// =========================================================
// ANIMAL MOTION STUDY — 마우스 인터랙션
// 마우스가 도형에 들어오면: 떨림(0.2초) → 부채꼴로 펼침
// 마우스가 영역을 벗어나면: 원래의 겹친 상태로 돌아옴
// =========================================================

// 1. 사용할 요소 가져오기
const stage = document.getElementById('stage');   // 인터랙션 영역
const fan = document.getElementById('fan');       // 도형 묶음
const shapes = document.querySelectorAll('.shape'); // 도형 5개

// 2. 펼쳐졌을 때 각 도형의 위치 (포스터 기준 px 단위)
//    x: 가로 이동, y: 세로 이동, r: 회전 각도(도)
const SPREAD = [
  { x: -260, y: 24, r: -30 },
  { x: -130, y: 6,  r: -15 },
  { x: 0,    y: -10, r: 0 },
  { x: 130,  y: 6,  r: 15 },
  { x: 260,  y: 24, r: 30 }
];

const SHIVER_TIME = 200; // 떨림 시간 (ms) — CSS의 0.2s와 같아야 함
const STAGGER = 60;      // 도형끼리 출발 시간 차이 (ms)

// 3. 사용자가 "동작 줄이기"를 켰는지 확인
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

let isOpen = false; // 지금 펼쳐져 있는지 기억

// 가운데 도형(2번)에서 몇 칸 떨어져 있는지 (0, 1, 2)
function distanceFromCenter(index) {
  return Math.abs(index - 2);
}

// 4. 펼치기
function openFan() {
  if (isOpen) return;
  isOpen = true;

  // 떨림 애니메이션 다시 시작하기
  // (클래스를 뺐다가 다시 넣어야 매번 처음부터 재생됩니다)
  fan.classList.remove('is-shivering');
  void fan.offsetWidth; // 브라우저가 변화를 인식하도록 강제로 다시 계산
  fan.classList.add('is-shivering');

  // 떨림이 끝난 뒤에 펼치기 시작 (동작 줄이기 모드에서는 바로)
  const wait = reduceMotion.matches ? 0 : SHIVER_TIME;

  shapes.forEach(function (shape, index) {
    const target = SPREAD[index];

    // 가운데에서 바깥쪽으로 차례로 퍼지도록 지연 시간 설정
    const delay = reduceMotion.matches ? 0 : wait + distanceFromCenter(index) * STAGGER;

    // CSS 변수 값을 바꾸면 .shape의 transform이 transition으로 움직입니다
    shape.style.setProperty('--delay', delay + 'ms');
    shape.style.setProperty('--x', target.x);
    shape.style.setProperty('--y', target.y);
    shape.style.setProperty('--r', target.r);
  });
}

// 5. 접기 (원래의 겹친 상태로)
function closeFan() {
  if (!isOpen) return;
  isOpen = false;

  fan.classList.remove('is-shivering');

  shapes.forEach(function (shape, index) {
    // 펼칠 때와 반대로, 바깥쪽 도형부터 먼저 돌아옵니다
    const delay = reduceMotion.matches ? 0 : (2 - distanceFromCenter(index)) * STAGGER;

    shape.style.setProperty('--delay', delay + 'ms');
    shape.style.setProperty('--x', 0);
    shape.style.setProperty('--y', 0);
    shape.style.setProperty('--r', 0);
  });
}

// 떨림이 끝나면 클래스 정리
fan.addEventListener('animationend', function (event) {
  if (event.animationName === 'shiver') {
    fan.classList.remove('is-shivering');
  }
});

// 6. 마우스 이벤트 연결
// 마우스가 도형 위에 들어오면 펼치기
shapes.forEach(function (shape) {
  shape.addEventListener('pointerenter', function (event) {
    if (event.pointerType === 'mouse') openFan();
  });
});

// 마우스가 인터랙션 영역(stage)을 벗어나면 접기
stage.addEventListener('pointerleave', function (event) {
  if (event.pointerType === 'mouse') closeFan();
});

// 7. 터치 화면: 탭할 때마다 펼치기 / 접기
stage.addEventListener('pointerup', function (event) {
  if (event.pointerType === 'mouse') return;
  if (isOpen) {
    closeFan();
  } else {
    openFan();
  }
});

// 8. 키보드: Tab 키로 그래픽에 포커스하면 펼치고, 벗어나면 접기
// (:focus-visible = 키보드로 포커스했을 때만 참 → 클릭·탭과 겹치지 않음)
stage.addEventListener('focus', function () {
  if (stage.matches(':focus-visible')) openFan();
});
stage.addEventListener('blur', closeFan);
