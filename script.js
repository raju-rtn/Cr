const seedReviews = [
  {
    course: "CS101 - Intro to Programming",
    professor: "Dr. Shah",
    rating: 5,
    difficulty: "Moderate",
    review:
      "Clear lectures, weekly coding labs, and practical projects. Heavy but fair workload with helpful TAs.",
  },
  {
    course: "ECON220 - Microeconomics",
    professor: "Prof. Martinez",
    rating: 4,
    difficulty: "Moderate",
    review:
      "Great real-world examples. Midterm was tricky but grading rubric was transparent.",
  },
  {
    course: "HIST140 - Modern World History",
    professor: "Dr. Kim",
    rating: 3,
    difficulty: "Easy",
    review:
      "Interesting readings and low-pressure quizzes. Discussions can feel a bit repetitive.",
  },
];

const storageKey = "coursescope-reviews";
const reviewForm = document.getElementById("reviewForm");
const reviewContainer = document.getElementById("reviewsContainer");
const reviewStats = document.getElementById("reviewStats");
const courseFilter = document.getElementById("courseFilter");
const ratingFilter = document.getElementById("ratingFilter");
const searchFilter = document.getElementById("searchFilter");

const getReviews = () => {
  const saved = localStorage.getItem(storageKey);
  if (!saved) {
    localStorage.setItem(storageKey, JSON.stringify(seedReviews));
    return [...seedReviews];
  }

  return JSON.parse(saved);
};

const saveReviews = (reviews) => {
  localStorage.setItem(storageKey, JSON.stringify(reviews));
};

const starRating = (value) => "★".repeat(value) + "☆".repeat(5 - value);

const renderCourseOptions = (reviews) => {
  const selected = courseFilter.value;
  const uniqueCourses = [...new Set(reviews.map((item) => item.course))].sort();
  courseFilter.innerHTML = '<option value="all">All Courses</option>';

  uniqueCourses.forEach((course) => {
    const option = document.createElement("option");
    option.value = course;
    option.textContent = course;
    courseFilter.append(option);
  });

  if (["all", ...uniqueCourses].includes(selected)) {
    courseFilter.value = selected;
  }
};

const renderReviews = () => {
  const reviews = getReviews();
  renderCourseOptions(reviews);

  const selectedCourse = courseFilter.value;
  const minimumRating = Number(ratingFilter.value);
  const query = searchFilter.value.trim().toLowerCase();

  const filtered = reviews.filter((item) => {
    const matchesCourse = selectedCourse === "all" || item.course === selectedCourse;
    const matchesRating = item.rating >= minimumRating;
    const matchesSearch =
      query.length === 0 ||
      item.professor.toLowerCase().includes(query) ||
      item.review.toLowerCase().includes(query) ||
      item.course.toLowerCase().includes(query);

    return matchesCourse && matchesRating && matchesSearch;
  });

  const avg =
    filtered.length === 0
      ? 0
      : (filtered.reduce((sum, item) => sum + item.rating, 0) / filtered.length).toFixed(1);

  reviewStats.textContent = `${filtered.length} review(s) shown • Average rating: ${avg}`;

  reviewContainer.innerHTML = "";
  if (filtered.length === 0) {
    reviewContainer.innerHTML = '<p class="card">No matching reviews yet. Try adjusting filters.</p>';
    return;
  }

  filtered
    .slice()
    .reverse()
    .forEach((item) => {
      const card = document.createElement("article");
      card.className = "review-card";
      card.innerHTML = `
        <div class="review-head">
          <div>
            <h4>${item.course}</h4>
            <p class="review-meta">${item.professor} • ${item.difficulty}</p>
          </div>
          <strong class="stars" aria-label="${item.rating} out of 5 stars">${starRating(item.rating)}</strong>
        </div>
        <p>${item.review}</p>
      `;
      reviewContainer.append(card);
    });
};

reviewForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(reviewForm);

  const newReview = {
    course: formData.get("course").toString().trim(),
    professor: formData.get("professor").toString().trim(),
    rating: Number(formData.get("rating")),
    difficulty: formData.get("difficulty").toString(),
    review: formData.get("review").toString().trim(),
  };

  const reviews = getReviews();
  reviews.push(newReview);
  saveReviews(reviews);

  reviewForm.reset();
  renderReviews();
});

[courseFilter, ratingFilter, searchFilter].forEach((element) => {
  element.addEventListener("input", renderReviews);
  element.addEventListener("change", renderReviews);
});

document.getElementById("scrollToForm").addEventListener("click", () => {
  document.getElementById("reviewFormSection").scrollIntoView({ behavior: "smooth" });
});

renderReviews();
