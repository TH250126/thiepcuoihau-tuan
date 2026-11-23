

/* =================================
   CẤU HÌNH
================================= */

const WEDDING_DATE = new Date("2027-01-25T11:00:00+07:00").getTime();



const photos = [
  "images/couple-1.jpg",
  "images/couple-2.jpg",
  "images/couple-3.jpg",
  "images/couple-4.jpg",

];

/* =================================
   MỞ PHONG BÌ
================================= */

const openButton = document.getElementById("openInvitation");
const envelope = document.getElementById("envelope");
const envelopeScreen = document.getElementById("envelopeScreen");
const invitation = document.getElementById("invitation");

const music = document.getElementById("backgroundMusic");
const musicButton = document.getElementById("musicToggle");

let invitationOpened = false;
let petalTimer = null;



/* =========================================
   TỰ ĐỘNG CUỘN TOÀN BỘ THIỆP
   THỜI GIAN: 30 GIÂY
   CÓ TẠM DỪNG / TIẾP TỤC
========================================= */

const AUTO_SCROLL_DURATION = 0;

let autoScrollFrame = null;
let autoScrollTimer = null;

let autoScrollActive = false;
let autoScrollProgress = 0;
let autoScrollButton = document.getElementById("autoScrollToggle");


/* =========================================
   DỪNG CUỘN
========================================= */

function stopAutoScroll() {
  autoScrollActive = false;

  if (autoScrollFrame !== null) {
    cancelAnimationFrame(autoScrollFrame);
    autoScrollFrame = null;
  }
}


/* =========================================
   CẬP NHẬT NÚT
========================================= */

function updateAutoScrollButton() {
  if (!autoScrollButton) return;

  autoScrollButton.textContent = autoScrollActive
    ? "TẠM DỪNG CUỘN"
    : "TIẾP TỤC CUỘN";
}


/* =========================================
   BẮT ĐẦU / TIẾP TỤC CUỘN
========================================= */

function startAutoScroll() {

  if (autoScrollActive || autoScrollProgress >= 1) {
    return;
  }

  autoScrollActive = true;

  const progressAtStart = autoScrollProgress;

  const remainingDuration =
    AUTO_SCROLL_DURATION * (1 - progressAtStart);

  let startTimestamp = null;

  updateAutoScrollButton();

  function animateScroll(timestamp) {

    if (!autoScrollActive) return;

    if (startTimestamp === null) {
      startTimestamp = timestamp;
    }

    const elapsed = timestamp - startTimestamp;

    const segmentProgress = Math.min(
      elapsed / remainingDuration,
      1
    );

    // Tính tiến trình tổng thể
    autoScrollProgress =
      progressAtStart +
      (1 - progressAtStart) * segmentProgress;

    // Tính chiều cao trang liên tục
    const maxScroll = Math.max(
      0,
      document.documentElement.scrollHeight -
      window.innerHeight
    );

    // Cuộn đều từ đầu đến cuối
    window.scrollTo(
      0,
      maxScroll * autoScrollProgress
    );

    if (segmentProgress < 1) {

      autoScrollFrame =
        requestAnimationFrame(animateScroll);

    } else {

      autoScrollProgress = 1;

      stopAutoScroll();

      updateAutoScrollButton();
    }
  }

  autoScrollFrame =
    requestAnimationFrame(animateScroll);
}


/* =========================================
   TẠM DỪNG VÀ LƯU VỊ TRÍ
========================================= */

function pauseAutoScroll() {

  stopAutoScroll();

  const maxScroll = Math.max(
    0,
    document.documentElement.scrollHeight -
    window.innerHeight
  );

  autoScrollProgress = maxScroll > 0
    ? Math.min(window.scrollY / maxScroll, 1)
    : 0;

  updateAutoScrollButton();
}


/* =========================================
   BẮT ĐẦU LẠI TỪ ĐẦU
========================================= */

function scrollToInvitation() {

  stopAutoScroll();

  clearTimeout(autoScrollTimer);

  autoScrollProgress = 0;

  window.scrollTo(0, 0);

  autoScrollTimer = setTimeout(() => {
    startAutoScroll();
  }, 500);
}


/* =========================================
   NÚT TẠM DỪNG / TIẾP TỤC
========================================= */

if (autoScrollButton) {

  autoScrollButton.addEventListener("click", () => {

    if (autoScrollActive) {

      pauseAutoScroll();

    } else {

      startAutoScroll();

    }

  });

}


/* =========================================
   TỰ DỪNG KHI NGƯỜI DÙNG CUỘN THỦ CÔNG
========================================= */

// Máy tính: cuộn bằng con lăn chuột
window.addEventListener("wheel", (event) => {

  if (autoScrollActive && Math.abs(event.deltaY) > 2) {
    pauseAutoScroll();
  }

}, { passive: true });


// Điện thoại: phát hiện thao tác kéo trang
let touchStartY = 0;

window.addEventListener("touchstart", (event) => {

  if (event.touches.length === 1) {
    touchStartY = event.touches[0].clientY;
  }

}, { passive: true });


window.addEventListener("touchmove", (event) => {

  if (!autoScrollActive || event.touches.length !== 1) {
    return;
  }

  const currentY = event.touches[0].clientY;

  if (Math.abs(currentY - touchStartY) > 8) {
    pauseAutoScroll();
  }

}, { passive: true });


// Bàn phím: phát hiện thao tác cuộn
window.addEventListener("keydown", (event) => {

  const scrollKeys = [
    "ArrowDown",
    "ArrowUp",
    "PageDown",
    "PageUp",
    "Home",
    "End",
    " "
  ];

  if (autoScrollActive && scrollKeys.includes(event.key)) {
    pauseAutoScroll();
  }

});



if (openButton) {
  openButton.addEventListener("click", async () => {

    if (invitationOpened) return;

    invitationOpened = true;

    // Mở phong bì
    if (envelope) {
      envelope.classList.add("open");
       setTimeout(function () {
    envelope.classList.add("letter-up");
  }, 900);
    }

    // Phát nhạc nền
    if (music) {
      music.volume = 0.35;

      try {
        await music.play();

        if (musicButton) {
          musicButton.classList.add("playing");
        }

      } catch (error) {
        console.log("Trình duyệt chưa cho phép phát nhạc tự động.");
      }
    }

    if (musicButton) {
      musicButton.style.display = "block";
    }

    // Bắt đầu hiệu ứng trái tim rơi
    startPetals();

    // Chờ phong bì mở hoàn tất
    setTimeout(() => {

      // Ẩn màn hình phong bì
      if (envelopeScreen) {
        envelopeScreen.classList.add("hide");
      }

      // Hiển thị nội dung thiệp
      if (invitation) {
        invitation.classList.add("show");
      }

      // Chờ giao diện hiển thị rồi mới cuộn
      setTimeout(() => {
        scrollToInvitation();
      }, 1400);

    }, 1600);

  });
}


/* =================================
   NHẠC NỀN
================================= */

if (musicButton && music) {
  musicButton.addEventListener("click", async () => {

    if (music.paused) {
      try {
        await music.play();
        musicButton.classList.add("playing");

      } catch (error) {
        alert("Không thể phát nhạc. Hãy kiểm tra file music.mp3.");
      }

    } else {
      music.pause();
      musicButton.classList.remove("playing");
    }

  });
}


/* =================================
   ĐẾM NGƯỢC NGÀY CƯỚI
================================= */

function updateCountdown() {

  const distance = WEDDING_DATE - Date.now();

  if (distance <= 0) {
    ["days", "hours", "minutes", "seconds"].forEach(id => {
      const element = document.getElementById(id);
      if (element) element.textContent = "00";
    });
    return;
  }

  const days = Math.floor(distance / 86400000);
  const hours = Math.floor((distance % 86400000) / 3600000);
  const minutes = Math.floor((distance % 3600000) / 60000);
  const seconds = Math.floor((distance % 60000) / 1000);

  const daysElement = document.getElementById("days");
  const hoursElement = document.getElementById("hours");
  const minutesElement = document.getElementById("minutes");
  const secondsElement = document.getElementById("seconds");

  if (daysElement) {
    daysElement.textContent = String(days).padStart(2, "0");
  }

  if (hoursElement) {
    hoursElement.textContent = String(hours).padStart(2, "0");
  }

  if (minutesElement) {
    minutesElement.textContent = String(minutes).padStart(2, "0");
  }

  if (secondsElement) {
    secondsElement.textContent = String(seconds).padStart(2, "0");
  }
}

updateCountdown();
setInterval(updateCountdown, 1000);


/* =================================
   ALBUM ẢNH
================================= */

let currentPhoto = 0;

const galleryImage = document.getElementById("galleryImage");
const dotsContainer = document.getElementById("galleryDots");

function renderDots() {

  if (!dotsContainer) return;

  dotsContainer.innerHTML = "";

  photos.forEach((photo, index) => {

    const dot = document.createElement("span");

    dot.className = "dot" +
      (index === currentPhoto ? " active" : "");

    dot.addEventListener("click", () => showPhoto(index));

    dotsContainer.appendChild(dot);

  });
}

function showPhoto(index) {

  if (!galleryImage) return;

  currentPhoto = (index + photos.length) % photos.length;

  galleryImage.style.opacity = "0";

  setTimeout(() => {

    galleryImage.onload = () => {
      galleryImage.style.opacity = "1";
    };

    galleryImage.onerror = () => {
      galleryImage.style.opacity = "1";
      console.error("Không tìm thấy ảnh:", photos[currentPhoto]);
    };

    galleryImage.src = photos[currentPhoto];

    renderDots();

  }, 180);
}

const prevPhotoButton = document.getElementById("prevPhoto");
const nextPhotoButton = document.getElementById("nextPhoto");

if (prevPhotoButton) {
  prevPhotoButton.addEventListener("click", () => {
    showPhoto(currentPhoto - 1);
  });
}

if (nextPhotoButton) {
  nextPhotoButton.addEventListener("click", () => {
    showPhoto(currentPhoto + 1);
  });
}

renderDots();


/* =================================
   VUỐT ẢNH TRÊN ĐIỆN THOẠI
================================= */

let touchStartX = 0;

if (galleryImage) {

  galleryImage.addEventListener("touchstart", event => {
    touchStartX = event.changedTouches[0].screenX;
  }, { passive: true });

  galleryImage.addEventListener("touchend", event => {

    const touchEndX = event.changedTouches[0].screenX;
    const difference = touchEndX - touchStartX;

    if (Math.abs(difference) > 45) {
      showPhoto(currentPhoto + (difference < 0 ? 1 : -1));
    }

  }, { passive: true });

}


/* =================================
   HIỆU ỨNG TRÁI TIM RƠI
================================= */

function createHeart() {

  const heart = document.createElement("div");

  heart.className = "heart";
  heart.innerHTML = "♥";

  // Vị trí xuất hiện ngẫu nhiên
  heart.style.left = Math.random() * 100 + "vw";

  // Kích thước ngẫu nhiên
  heart.style.fontSize =
    (12 + Math.random() * 20) + "px";

  // Màu sắc ngẫu nhiên
  const colors = [
    "#8b1e35",
    "#b83d58",
    "#d98596",
    "#c5a16a",
    "#e9aeb9"
  ];

  heart.style.color =
    colors[Math.floor(Math.random() * colors.length)];

  // Tốc độ rơi ngẫu nhiên
  heart.style.animationDuration =
    (5 + Math.random() * 6) + "s";

  document.body.appendChild(heart);

  // Xóa trái tim sau khi rơi xong
  setTimeout(() => {
    heart.remove();
  }, 12000);
}

function startPetals() {

  if (petalTimer) return;

  // Trái tim xuất hiện ngay khi mở thiệp
  for (let i = 0; i < 8; i++) {
    setTimeout(createHeart, i * 250);
  }

  // Tiếp tục tạo trái tim rơi
  petalTimer = setInterval(createHeart, 500);
}



/* =================================
   RSVP - XÁC NHẬN THAM DỰ
================================= */

// URL GOOGLE APPS SCRIPT
const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwkGOOrHMInjlFU0EGuXeuTksP3RLgHwCzsmVxwyGRbE_64cyoBl2-1WrLv3XMclXA/exec";


const rsvpForm = document.getElementById("rsvpForm");
const rsvpMessage = document.getElementById("rsvpMessage");


if (rsvpForm) {

  rsvpForm.addEventListener("submit", async event => {

    event.preventDefault();

    // KIỂM TRA URL
    if (
      !GOOGLE_SCRIPT_URL ||
      !GOOGLE_SCRIPT_URL.includes("/exec")
    ) {

      if (rsvpMessage) {
        rsvpMessage.textContent =
          "Thiệp chưa được kết nối Google Sheets.";
      }

      return;
    }

    // LẤY DỮ LIỆU FORM
    const formData = new FormData(rsvpForm);

    const data = {
      name: formData.get("name"),
      attendance: formData.get("attendance"),
      guests: formData.get("guests"),
      message: formData.get("message")
    };

    const submitButton =
      rsvpForm.querySelector("button[type='submit']");

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "ĐANG GỬI...";
    }

    try {

      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded;charset=UTF-8"
        },
        body: new URLSearchParams(data)
      });

      if (rsvpMessage) {
        rsvpMessage.textContent =
          "Cảm ơn bạn đã gửi xác nhận. Chúng mình rất vui khi nhận được phản hồi!";
      }

      rsvpForm.reset();

    } catch (error) {

      console.error("Lỗi gửi RSVP:", error);

      if (rsvpMessage) {
        rsvpMessage.textContent =
          "Có lỗi khi gửi. Vui lòng thử lại sau.";
      }

    } finally {

      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "GỬI XÁC NHẬN";
      }

    }

  });

}



/* ==========================================
   FADE TYPING - KHI KHÁCH CUỘN ĐẾN LỜI MỜI
   THIỆP CƯỚI H&T
========================================== */

(function () {

  function initFadeTyping() {

    const textElement = document.getElementById("invitationText123");

    if (!textElement) {
      console.log("Không tìm thấy invitationText123");
      return;
    }

    // Lấy nội dung ban đầu
    const fullText = textElement.textContent
      .replace(/\s+/g, " ")
      .trim();

    // Tránh chạy lại nhiều lần
    let hasStarted = false;

    // Tách từng ký tự
    function createCharacters() {

      textElement.textContent = "";

      const fragment = document.createDocumentFragment();

      [...fullText].forEach(function (character) {

        const span = document.createElement("span");

        span.className = "typing-char";
        span.textContent = character;

        // Giữ khoảng trắng giữa các từ
        if (character === " ") {
          span.innerHTML = "&nbsp;";
        }

        fragment.appendChild(span);

      });

      textElement.appendChild(fragment);
    }

    // Bắt đầu hiệu ứng
    function startAnimation() {

      if (hasStarted) return;

      hasStarted = true;

      createCharacters();

      const characters = textElement.querySelectorAll(".typing-char");

      characters.forEach(function (character, index) {

        character.style.animationDelay = (index * 0.03) + "s";

      });

      observer.disconnect();

      console.log("Fade Typing đã bắt đầu!");

    }

    // Theo dõi khi khách cuộn đến đoạn chữ
    const observer = new IntersectionObserver(function (entries) {

      entries.forEach(function (entry) {

        if (entry.isIntersecting) {

          startAnimation();

        }

      });

    }, {
      threshold: 0.15
    });

    observer.observe(textElement);

  }

  if (document.readyState === "loading") {

    document.addEventListener("DOMContentLoaded", initFadeTyping);

  } else {

    initFadeTyping();

  }

})();

/* ==========================================
   ALBUM H&T - SCROLL REVEAL + HEART EFFECT
========================================== */

document.addEventListener("DOMContentLoaded", function () {

  const gallery = document.querySelector(".gallery-section");

  if (!gallery) return;

  // 1. HIỆU ỨNG XUẤT HIỆN KHI CUỘN

  const revealElements = gallery.querySelectorAll(
    ".reveal-left, .reveal-right, .reveal-text"
  );

  const revealObserver = new IntersectionObserver(function (entries) {

    entries.forEach(function (entry) {

      if (entry.isIntersecting) {

        entry.target.classList.add("show");

        revealObserver.unobserve(entry.target);

      }

    });

  }, {
    threshold: 0.15
  });

  revealElements.forEach(function (element) {
    revealObserver.observe(element);
  });


  // 2. TẠO HIỆU ỨNG TRÁI TIM BAY

  const heartContainer = gallery.querySelector(".gallery-hearts");

  let heartsCreated = false;

  const heartObserver = new IntersectionObserver(function (entries) {

    entries.forEach(function (entry) {

      if (entry.isIntersecting && !heartsCreated) {

        heartsCreated = true;

        for (let i = 0; i < 10; i++) {

          const heart = document.createElement("span");

          heart.className = "gallery-heart";
          heart.textContent = "♥";

          heart.style.left = (5 + Math.random() * 90) + "%";
          heart.style.animationDelay = (Math.random() * 2) + "s";
          heart.style.fontSize = (12 + Math.random() * 12) + "px";

          heartContainer.appendChild(heart);

          heart.addEventListener("animationend", function () {
            heart.remove();
          });

        }

        heartObserver.disconnect();

      }

    });

  }, {
    threshold: 0.2
  });

  heartObserver.observe(gallery);

});