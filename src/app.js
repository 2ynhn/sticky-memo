// AirDatepicker(3.6.0) 기반 펜션 예약 달력 래퍼
// 사용 전 index.html 에서 vendor/air-datepicker/air-datepicker.js 를 로드해
// 전역 AirDatepicker 가 존재해야 합니다.

const KO_LOCALE = {
  days: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
  daysShort: ['일', '월', '화', '수', '목', '금', '토'],
  daysMin: ['일', '월', '화', '수', '목', '금', '토'],
  months: [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월',
  ],
  monthsShort: [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월',
  ],
  today: '오늘',
  clear: '초기화',
  dateFormat: 'yyyy-MM-dd',
  timeFormat: 'HH:mm',
  firstDay: 0,
};

function parseIsoDate(isoString) {
  const [year, month, day] = isoString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function toIsoDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

class reservCalendar {
  constructor(container) {
    this.container =
      typeof container === 'string' ? document.querySelector(container) : container;
    this.instance = null;
  }

  /**
   * @param {object} options
   * @param {string[]} options.availableDates - 선택 가능한 날짜('YYYY-MM-DD') 목록. 그 외 날짜는 전부 선택 불가.
   * @param {string[]} [options.reservedDates] - '예약' 뱃지를 표시할 날짜 목록.
   * @param {string[]} [options.closedDates] - '마감' 뱃지를 표시할 날짜 목록.
   * @param {(iso: string, date: Date) => void} [options.onSelectDate] - 선택 가능한 날짜를 선택했을 때 콜백.
   * @param {(view: { year: number, month: number, date: Date }) => void} [options.onChangeMonth] - 달력의 표시 월이 바뀔 때(다음/이전 달 클릭 포함) 콜백. month 는 0(1월)~11(12월).
   */
  render({
    availableDates = [],
    reservedDates = [],
    closedDates = [],
    onSelectDate,
    onChangeMonth,
  } = {}) {
    this.destroy();

    const availableSet = new Set(availableDates);
    const reservedSet = new Set(reservedDates);
    const closedSet = new Set(closedDates);

    const firstAvailableIso = [...availableDates].sort()[0];
    const firstAvailableDate = firstAvailableIso ? parseIsoDate(firstAvailableIso) : null;

    this.instance = new AirDatepicker(this.container, {
      inline: true,
      autoClose: false,
      locale: KO_LOCALE,
      startDate: firstAvailableDate || new Date(),

      onRenderCell: ({ date, cellType }) => {
        if (cellType !== 'day') return {};

        const iso = toIsoDate(date);
        let badgeText = '';
        if (reservedSet.has(iso)) {
          badgeText = '예약';
        } else if (closedSet.has(iso)) {
          badgeText = '마감';
        }

        return {
          disabled: !availableSet.has(iso),
          classes: badgeText ? '-pension-badge-' : '',
          html: badgeText
            ? `<span class="pension-cell-date">${date.getDate()}</span><span class="pension-cell-badge">${badgeText}</span>`
            : undefined,
        };
      },

      onSelect: ({ date }) => {
        if (!date || typeof onSelectDate !== 'function') return;
        const iso = toIsoDate(date);
        if (availableSet.has(iso)) {
          onSelectDate(iso, date);
        }
      },

      onChangeViewDate: ({ year, month }) => {
        if (typeof onChangeMonth === 'function') {
          onChangeMonth({ year, month, date: new Date(year, month, 1) });
        }
      },
    });

    // init 직후 선택 가능한 날짜 중 가장 빠른 날짜를 자동 선택 (onSelect 콜백도 함께 호출됨)
    if (firstAvailableDate) {
      this.instance.selectDate(firstAvailableDate);
    }

    return this.instance;
  }

  destroy() {
    if (this.instance) {
      this.instance.destroy();
      this.instance = null;
    }
  }
}

// 데모용 호실별 예약 데이터
const ROOMS = [
  {
    id: 'room-a',
    name: 'A호실 (오션뷰)',
    availableDates: [
      '2026-07-14', '2026-07-15', '2026-07-16', '2026-07-17',
      '2026-07-20', '2026-07-21', '2026-07-22', '2026-07-24',
      '2026-07-25', '2026-07-26',
    ],
    reservedDates: ['2026-07-11', '2026-07-13', '2026-07-23'],
    closedDates: ['2026-07-01', '2026-07-02', '2026-07-03', '2026-07-31'],
  },
  {
    id: 'room-b',
    name: 'B호실 (마운틴뷰)',
    availableDates: [
      '2026-07-12', '2026-07-13', '2026-07-18', '2026-07-19',
      '2026-08-01', '2026-08-02', '2026-08-03',
    ],
    reservedDates: ['2026-07-10', '2026-07-17'],
    closedDates: ['2026-07-04', '2026-07-05'],
  },
  {
    id: 'room-c',
    name: 'C호실 (풀빌라)',
    availableDates: ['2026-08-05', '2026-08-06', '2026-08-07'],
    reservedDates: ['2026-08-01'],
    closedDates: ['2026-08-02', '2026-08-03'],
  },
];

const calendarEl = document.querySelector('.datepicker');
const statusEl = document.querySelector('#status');
const calendar = new reservCalendar(calendarEl);

function initCalendarForRoom(roomId) {
  const room = ROOMS.find((r) => r.id === roomId);
  if (!room) return;

  document
    .querySelectorAll('.room-button')
    .forEach((btn) => btn.classList.toggle('is-active', btn.dataset.roomId === room.id));

  statusEl.textContent = `${room.name} 달력을 불러오는 중...`;

  calendar.render({
    availableDates: room.availableDates,
    reservedDates: room.reservedDates,
    closedDates: room.closedDates,
    onSelectDate(iso) {
      statusEl.textContent = `[${room.name}] ${iso} 선택됨`;
    },
    onChangeMonth({ year, month }) {
      console.log(`[${room.name}] 달력 이동: ${year}년 ${month + 1}월`);
    },
  });
}

// index.html 각 버튼의 onclick="initCalendarForRoom('room-x')" 에서 직접 호출
window.initCalendarForRoom = initCalendarForRoom;
