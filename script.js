const monthTitle = document.querySelector(".calendar-header h2");
const calendar = document.querySelector(".calendar");

const subjectInput = document.getElementById("subject");
const topicInput = document.getElementById("topic");
const studyDateInput = document.getElementById("studyDate");
const addReviewButton = document.getElementById("addReview");
const todayReviewList = document.getElementById("todayReviewList");
const reviewNotice = document.getElementById("reviewNotice");

let currentYear = 2026;
let currentMonth = 9;


// 💾 저장되어 있는 공부 기록 불러오기
let studyRecords = JSON.parse(
  localStorage.getItem("studyRecords")
) || [];


// 날짜를 YYYY-MM-DD 형태로 만들기
function formatDate(date) {

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}


// 복습 날짜 계산
function getReviewDate(studyDate, daysAfter) {

  const date = new Date(studyDate + "T00:00:00");

  date.setDate(date.getDate() + daysAfter);

  return formatDate(date);
}


// 📚 공부 내용 추가
addReviewButton.addEventListener("click", function() {

  const subject = subjectInput.value.trim();
  const topic = topicInput.value.trim();
  const studyDate = studyDateInput.value;


  if (!subject || !topic || !studyDate) {

    alert("과목, 공부한 내용, 날짜를 모두 입력해주세요!");

    return;
  }


  const record = {

    subject: subject,

    topic: topic,

    studyDate: studyDate,

    // 공부한 날 = 1일차
    review2: getReviewDate(studyDate, 1),

    // 공부한 날 + 6일
    review7: getReviewDate(studyDate, 6),

    // 공부한 날 + 13일
    review14: getReviewDate(studyDate, 13)

  };


  studyRecords.push(record);


  // 💾 브라우저에 저장
  localStorage.setItem(
    "studyRecords",
    JSON.stringify(studyRecords)
  );


  alert("복습 일정이 저장되었어요! 📚");


  subjectInput.value = "";
  topicInput.value = "";
  studyDateInput.value = "";


  makeCalendar();
makeTodayReviewList();

});


// 📅 달력 만들기
function makeCalendar() {

  monthTitle.textContent =
    `${currentYear}년 ${currentMonth + 1}월`;

  calendar.innerHTML = "";

  const firstDay =
    new Date(currentYear, currentMonth, 1).getDay();

  const lastDate =
    new Date(currentYear, currentMonth + 1, 0).getDate();

  // 첫 날짜 전 빈칸
  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement("div");
    calendar.appendChild(empty);
  }

  // 날짜 만들기
  for (let day = 1; day <= lastDate; day++) {

    const dateBox = document.createElement("div");

    const dateString =
      `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    // 날짜 클릭 → 날짜 기록 팝업
    dateBox.addEventListener("click", function() {
      openDayModal(dateString);
    });

    // 날짜 숫자
    const number = document.createElement("div");
    number.textContent = day;
    number.className = "day-number";
    dateBox.appendChild(number);

    // 기록을 담는 공간
    const eventsBox = document.createElement("div");
    eventsBox.className = "events-box";

    // 오늘 날짜 표시
    const today = new Date();

    if (
      today.getFullYear() === currentYear &&
      today.getMonth() === currentMonth &&
      today.getDate() === day
    ) {
      dateBox.classList.add("today");
    }

    // 최대 2개까지만 표시
    let eventCount = 0;
    const maxVisibleEvents = 2;

    // 전체 기록 개수 확인용
    let totalEventCount = 0;

    studyRecords.forEach(record => {

      if (record.studyDate === dateString) {
        totalEventCount++;
      }

      if (record.review2 === dateString) {
        totalEventCount++;
      }

      if (record.review7 === dateString) {
        totalEventCount++;
      }

      if (record.review14 === dateString) {
        totalEventCount++;
      }

    });

    // 실제 기록 표시
    studyRecords.forEach(record => {

      if (eventCount >= maxVisibleEvents) {
        return;
      }

      // 공부한 날
      if (record.studyDate === dateString) {

        const event = document.createElement("div");

        event.innerHTML = `📖 ${record.subject}`;
        event.className = "event study-event";
        event.title = record.topic;
        event.style.cursor = "pointer";

        event.addEventListener("click", function(e) {
          e.stopPropagation();
          openEditModal(record);
        });

        eventsBox.appendChild(event);
        eventCount++;

        return;
      }

      // 2일차 복습
      if (record.review2 === dateString) {

        const event = document.createElement("div");

        event.innerHTML =
          `<span class="circle circle2"></span>${record.subject} · 2일차`;

        event.className = "event review2-event";
        event.title =
          `${record.topic} · 2일차 복습`;

        eventsBox.appendChild(event);
        eventCount++;

        return;
      }

      // 7일차 복습
      if (record.review7 === dateString) {

        const event = document.createElement("div");

        event.innerHTML =
          `<span class="circle circle7"></span>${record.subject} · 7일차`;

        event.className = "event review7-event";
        event.title =
          `${record.topic} · 7일차 복습`;

        eventsBox.appendChild(event);
        eventCount++;

        return;
      }

      // 14일차 복습
      if (record.review14 === dateString) {

        const event = document.createElement("div");

        event.innerHTML =
          `<span class="circle circle14"></span>${record.subject} · 14일차`;

        event.className = "event review14-event";
        event.title =
          `${record.topic} · 14일차 복습`;

        eventsBox.appendChild(event);
        eventCount++;
      }

    });

    // 2개보다 기록이 많으면 +n개 표시
    if (totalEventCount > maxVisibleEvents) {

      const more = document.createElement("div");

      more.className = "more-events";

      more.textContent =
        `+ ${totalEventCount - maxVisibleEvents}개`;

      eventsBox.appendChild(more);
    }

    dateBox.appendChild(eventsBox);

    calendar.appendChild(dateBox);
  }
}

// 📚 오늘 복습할 목록 만들기
function makeTodayReviewList() {

  todayReviewList.innerHTML = "";

  const today = formatDate(new Date());

  let hasReview = false;

  // 오늘 복습 목록 만들기
  studyRecords.forEach(record => {

    if (record.review2 === today) {
      addTodayReview(record, "2일차", "circle2");
      hasReview = true;
    }

    if (record.review7 === today) {
      addTodayReview(record, "7일차", "circle7");
      hasReview = true;
    }

    if (record.review14 === today) {
      addTodayReview(record, "14일차", "circle14");
      hasReview = true;
    }

  });


  // 🔔 오늘 복습 알림
  const checkboxes =
    todayReviewList.querySelectorAll("input[type='checkbox']");

  const reviewCount = checkboxes.length;


  if (reviewCount > 0) {

    reviewNotice.textContent =
      `🔔 오늘 복습할 내용이 ${reviewCount}개 있어요!`;

    reviewNotice.style.display = "block";

    reviewNotice.style.cursor = "pointer";

    reviewNotice.onclick = function() {

      document.querySelector(".today-review").scrollIntoView({
        behavior: "smooth"
      });

    };

  } else {

    reviewNotice.style.display = "none";

    reviewNotice.onclick = null;

  }


  // 📭 오늘 복습할 내용이 없을 때
  if (!hasReview) {

    todayReviewList.innerHTML =
      `<p class="no-review">오늘 복습할 내용이 없어요!</p>`;

    return;
  }


  // 🎉 모든 복습을 완료했는지 확인
  const allCompleted =
    [...checkboxes].every(checkbox => checkbox.checked);


  if (allCompleted) {

    todayReviewList.innerHTML = `
      <div class="all-complete">
        🎉 오늘 복습을 모두 완료했어요!
        <button id="showTodayReviews">복습 목록 보기</button>
      </div>
    `;


    document
      .getElementById("showTodayReviews")
      .addEventListener("click", function() {

        todayReviewList.innerHTML = "";

        studyRecords.forEach(record => {

          if (record.review2 === today) {
            addTodayReview(record, "2일차", "circle2");
          }

          if (record.review7 === today) {
            addTodayReview(record, "7일차", "circle7");
          }

          if (record.review14 === today) {
            addTodayReview(record, "14일차", "circle14");
          }

        });

      });

  }

}


// 오늘 복습 하나 만들기
function addTodayReview(record, reviewDay, circleClass) {

  const item = document.createElement("div");

  item.className = "today-review-item";

  // 완료 여부 확인
  const completedKey = `${record.studyDate}-${record.subject}-${record.topic}-${reviewDay}`;
  const completed =
    localStorage.getItem(`completed-${completedKey}`) === "true";

  item.innerHTML = `
    <label class="review-check">
      <input type="checkbox" ${completed ? "checked" : ""}>
      <span class="circle ${circleClass}"></span>
      <div>
        <strong>${record.subject} · ${reviewDay}</strong>
        <p>${record.topic}</p>
      </div>
    </label>
  `;

  const checkbox = item.querySelector("input");

  checkbox.addEventListener("change", function() {

    localStorage.setItem(
      `completed-${completedKey}`,
      checkbox.checked
    );

    makeTodayReviewList();

  });

  todayReviewList.appendChild(item);

}

// ◀️ 이전 달
const buttons =
  document.querySelectorAll(
    ".calendar-header button"
  );


buttons[0].onclick = function() {

  currentMonth--;

  if (currentMonth < 0) {

    currentMonth = 11;

    currentYear--;

  }

  makeCalendar();

};


// ▶️ 다음 달
buttons[1].onclick = function() {

  currentMonth++;

  if (currentMonth > 11) {

    currentMonth = 0;

    currentYear++;

  }

  makeCalendar();

};

// ✏️ 공부 기록 수정창
const editModal = document.getElementById("editModal");
const editSubject = document.getElementById("editSubject");
const editTopic = document.getElementById("editTopic");
const editDate = document.getElementById("editDate");
const saveEdit = document.getElementById("saveEdit");
const cancelEdit = document.getElementById("cancelEdit");
const deleteRecord = document.getElementById("deleteRecord");

let editingRecord = null;


// 수정창 열기
function openEditModal(record) {

  editingRecord = record;

  editSubject.value = record.subject;
  editTopic.value = record.topic;
  editDate.value = record.studyDate;

  editModal.style.display = "flex";
}


// 취소
cancelEdit.addEventListener("click", function() {

  editModal.style.display = "none";

  editingRecord = null;

});


// 저장
saveEdit.addEventListener("click", function() {

  if (!editingRecord) return;

  const newSubject = editSubject.value.trim();
  const newTopic = editTopic.value.trim();
  const newDate = editDate.value;

  if (!newSubject || !newTopic || !newDate) {

    alert("모든 내용을 입력해주세요!");

    return;
  }


  editingRecord.subject = newSubject;
  editingRecord.topic = newTopic;
  editingRecord.studyDate = newDate;

  // 복습 날짜 다시 계산
  editingRecord.review2 =
    getReviewDate(newDate, 1);

  editingRecord.review7 =
    getReviewDate(newDate, 6);

  editingRecord.review14 =
    getReviewDate(newDate, 13);


  // 저장
  localStorage.setItem(
    "studyRecords",
    JSON.stringify(studyRecords)
  );


  editModal.style.display = "none";

  editingRecord = null;


  makeCalendar();
  makeTodayReviewList();

  alert("공부 기록이 수정되었어요! ✏️");

});

// 🗑️ 공부 기록 삭제
deleteRecord.addEventListener("click", function() {

  if (!editingRecord) return;

  const confirmDelete = confirm(
    `${editingRecord.subject} - ${editingRecord.topic}\n\n이 공부 기록과 복습 일정을 삭제할까요?`
  );

  if (!confirmDelete) return;

  studyRecords = studyRecords.filter(
    item => item !== editingRecord
  );

  localStorage.setItem(
    "studyRecords",
    JSON.stringify(studyRecords)
  );

  editModal.style.display = "none";

  editingRecord = null;

  makeCalendar();
  makeTodayReviewList();

});

// 🚀 처음 실행
makeCalendar();
makeTodayReviewList();

const dayModal = document.getElementById("dayModal");
const dayModalTitle = document.getElementById("dayModalTitle");
const dayRecordList = document.getElementById("dayRecordList");
const closeDayModal = document.getElementById("closeDayModal");

function openDayModal(dateString) {

  dayRecordList.innerHTML = "";

  const records = [];

  studyRecords.forEach(record => {

    if (record.studyDate === dateString) {
      records.push({
        type: "📖 공부",
        subject: record.subject,
        topic: record.topic,
        record: record
      });
    }

    if (record.review2 === dateString) {
      records.push({
        type: "🟡 2일차 복습",
        subject: record.subject,
        topic: record.topic,
        record: record
      });
    }

    if (record.review7 === dateString) {
      records.push({
        type: "🟢 7일차 복습",
        subject: record.subject,
        topic: record.topic,
        record: record
      });
    }

    if (record.review14 === dateString) {
      records.push({
        type: "🔵 14일차 복습",
        subject: record.subject,
        topic: record.topic,
        record: record
      });
    }

  });

  const [year, month, day] = dateString.split("-");

  dayModalTitle.textContent =
    `📅 ${year}년 ${Number(month)}월 ${Number(day)}일`;

  if (records.length === 0) {

    dayRecordList.innerHTML =
      `<p class="no-review">이 날짜에는 기록이 없어요!</p>`;

  } else {

    records.forEach(item => {

      const recordBox = document.createElement("div");
      recordBox.className = "day-record";

      recordBox.innerHTML = `
        <strong>${item.type} · ${item.subject}</strong>
        <p>${item.topic}</p>
      `;

      // 공부 기록을 누르면 수정 창 열기
      if (item.type === "📖 공부") {

        recordBox.addEventListener("click", function() {
          dayModal.style.display = "none";
          openEditModal(item.record);
        });

      }

      dayRecordList.appendChild(recordBox);

    });

  }

  dayModal.style.display = "flex";
}

closeDayModal.addEventListener("click", function() {
  dayModal.style.display = "none";
});