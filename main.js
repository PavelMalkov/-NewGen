const courses = [
  { name: "Courses in England", prices: [0, 100] },
  { name: "Courses in Germany", prices: [500, null] },
  { name: "Courses in France", prices: [null, null] },
  { name: "Courses in Kazakhstan", prices: [56, 324] },
  { name: "Courses in Italy", prices: [100, 200] },
  { name: "Courses in USA", prices: [200, null] },
  { name: "Courses in Russia", prices: [null, 400] },
  { name: "Courses in China", prices: [50, 250] },
];

// Варианты цен (фильтры), которые ищет пользователь
const requiredRange1 = [null, 200];
const requiredRange2 = [100, 350];
const requiredRange3 = [200, null];

const filterCoursesByRange = (courses, range) => {
  return courses.filter((course) => {
    const leftBoundChecked = (range[0] ?? 0) <= (course.prices[1] ?? Infinity);
    const rightBoundChecked = (range[1] ?? Infinity) >= (course.prices[0] ?? 0);
    return leftBoundChecked && rightBoundChecked;
  });
};
console.log(requiredRange1);
console.log(filterCoursesByRange(courses, requiredRange1));
console.log(requiredRange2);
console.log(filterCoursesByRange(courses, requiredRange2));
console.log(requiredRange3);
console.log(filterCoursesByRange(courses, requiredRange3));

const sortCouresOnPrices = (a, b) => {
  if (a.prices[0] === null) return -1;
  else return a.prices[0] - b.prices[0];
};

Sorted = courses.sort(sortCouresOnPrices);
console.log("----------------------------------------------------------------");
console.log(Sorted);
