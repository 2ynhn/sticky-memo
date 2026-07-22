import { PensionCalendar } from './pension-calendar.js';

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
const calendar = new PensionCalendar(calendarEl);

function initCalendarForRoom(room) {
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

document.querySelectorAll('.room-button').forEach((button) => {
  button.addEventListener('click', () => {
    const room = ROOMS.find((r) => r.id === button.dataset.roomId);
    if (room) initCalendarForRoom(room);
  });
});
