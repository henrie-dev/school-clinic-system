import { auth } from './firebase-init.js';
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";

document.addEventListener('DOMContentLoaded', () => {
  // Function to get the current week's dates
  const getWeekDates = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); //function to get the day of the week
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek);

    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      weekDates.push(date.getDate());
    }
    return weekDates;
  };

  // Dummy data to simulate backend schedule response
  const scheduleData = {
    doctor: [true, false, false, true, true, true, false],
    dentist: [false, false, true, false, false, false, true]
  };

  // Render week dates in schedule-dates container
  const weekDates = getWeekDates();
  const datesContainer = document.getElementById('schedule-dates');
  datesContainer.innerHTML = weekDates.map(day => `<span class="p-2">${day}</span>`).join('');

  // Render schedule checkboxes for doctor and dentist
  const doctorScheduleContainer = document.getElementById('doctor-schedule');
  const dentistScheduleContainer = document.getElementById('dentist-schedule');

  const createCheckBoxes = (schedule) => {
    return schedule.map(isScheduled => {
      const checkedClass = isScheduled ? 'check-box-checked' : '';
      const checkMarkVisibility = isScheduled ? 'opacity-100' : 'opacity-0';
      return `
        <div class="flex items-center justify-center">
          <div class="check-box ${checkedClass}">
            <span class="check-mark ${checkMarkVisibility}">&#10003;</span>
          </div>
        </div>
      `;
    }).join('');
  };

  doctorScheduleContainer.innerHTML = createCheckBoxes(scheduleData.doctor);
  dentistScheduleContainer.innerHTML = createCheckBoxes(scheduleData.dentist);

  // Handle login form submission
  document.getElementById('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const messageBox = document.getElementById('messageBox');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      messageBox.textContent = `Login successful! Welcome, ${email}.`;
      messageBox.classList.remove('hidden', 'bg-red-500');
      messageBox.classList.add('bg-indigo-600');

      // Redirect to homepage after 1 second
      setTimeout(() => {
        window.location.href = 'homepage.html';
      }, 1000);

    } catch (error) {
      messageBox.textContent = error.message || 'Login failed.';
      messageBox.classList.remove('hidden', 'bg-indigo-600');
      messageBox.classList.add('bg-red-500');
      console.error('Login error:', error);
    }
  });
});
