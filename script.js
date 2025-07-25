const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
const closeMenu = document.getElementById('closeMenu');
        
hamburger.addEventListener('click', () => {
    mobileMenu.classList.toggle('active');
});
closeMenu.addEventListener('click', () => {
    mobileMenu.classList.remove('active');
});
mobileMenu.addEventListener('click', (event) => {
    if (event.target.tagName === 'BUTTON') {
        mobileMenu.classList.remove('active');
    }
});

// Clear all history
document.getElementById('clearAllHistory').addEventListener('click', () => {
    if (confirm("Are you sure you want to clear all completed tasks from history?")) {
        // Tüm geçmiş görevleri sil
        localStorage.removeItem('taskHistory');
        // Geçmiş listesini temizle
        const taskHistoryList = document.getElementById('taskHistory');
        taskHistoryList.innerHTML = '';
        // Yalnızca tamamlanmamış görevleri tut
        tasks = tasks.filter(task => !task.completed);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderTasks();
        updateStats();
        updateChart();
    }
});
        // İçe Aktarma Özelliği
          document.getElementById('desktopImportTasks').addEventListener('click', () => {
              // Dosya seçici oluşturma
              const fileInput = createFileInput();
              
              // Dosya seçildiğinde
              fileInput.addEventListener('change', handleFileSelect);
              
              // Dosya seçiciyi tetikle
              fileInput.click();
          });
          
          document.getElementById('mobileImportTasks').addEventListener('click', () => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'application/json';
              input.addEventListener('change', (event) => {
                  const file = event.target.files[0];
                  if (!file) return;
      
                  const reader = new FileReader();
                  reader.onload = (e) => {
                      try {
                          const importedTasks = JSON.parse(e.target.result);
                          if (Array.isArray(importedTasks)) {
                              tasks = tasks.concat(importedTasks);
                              localStorage.setItem('tasks', JSON.stringify(tasks));
                              renderTasks();
                              updateStats();
                              updateChart();
                              alert('Tasks imported successfully!');
                          } else {
                              throw new Error('Invalid file format');
                          }
                      } catch (error) {
                          alert('Error importing tasks. Please upload a valid JSON file.');
                      }
                  };
                  reader.readAsText(file);
              });
              input.click();
          });
          
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        
document.getElementById('desktopExportTasks').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(tasks)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tasks.json';
    a.click();
});
document.getElementById('mobileExportTasks').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(tasks)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tasks.json';
    a.click();
});
        // Modal operations
        const modal = document.getElementById('taskModal');
        const taskForm = document.getElementById('taskForm');
        let currentTaskId = null;

        function openModal(taskId = null) {
            modal.style.display = 'block';
            if (taskId) {
                currentTaskId = taskId;
                const task = tasks.find(t => t.id === taskId);
                document.getElementById('modalTitle').textContent = 'Edit Task';
                document.getElementById('taskId').value = task.id;
                document.getElementById('taskTitle').value = task.title;
                document.getElementById('taskCategory').value = task.category;
                
                // Tarih ve saati ayır
                const [date, time] = task.dueDate.split('T');
                document.getElementById('taskDueDate').value = date;
                document.getElementById('taskDueTime').value = time || '00:00';
                
                document.getElementById('taskPriority').value = task.priority;
                document.getElementById('taskEstimatedTime').value = task.estimatedTime;
                document.getElementById('taskDescription').value = task.description;
            } else {
                document.getElementById('modalTitle').textContent = 'New Task';
                taskForm.reset();
                // Varsayılan saat değeri
                document.getElementById('taskDueTime').value = '23:59';
                currentTaskId = null;
            }
        }

        function closeModal() {
            modal.style.display = 'none';
            taskForm.reset();
            currentTaskId = null;
        }

        // Form submission
        taskForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const dueDate = document.getElementById('taskDueDate').value;
            const dueTime = document.getElementById('taskDueTime').value;
            
            const taskData = {
                id: currentTaskId || Date.now(),
                title: document.getElementById('taskTitle').value,
                category: document.getElementById('taskCategory').value,
                dueDate: `${dueDate}T${dueTime}`, // Tarih ve saati birleştir
                priority: document.getElementById('taskPriority').value,
                estimatedTime: document.getElementById('taskEstimatedTime').value,
                description: document.getElementById('taskDescription').value,
                completed: false,
                isRecurring: document.getElementById('taskRecurring').checked,
                recurringType: document.getElementById('recurringType').value,
                recurringInterval: parseInt(document.getElementById('recurringInterval').value) || 1,
                recurringEndDate: document.getElementById('recurringEndDate').value || null
            };

            if (currentTaskId) {
                const index = tasks.findIndex(t => t.id === currentTaskId);
                tasks[index] = { ...tasks[index], ...taskData };
            } else {
                if (taskData.isRecurring) {
                    createRecurringTasks(taskData);
                } else {
                    tasks.push(taskData);
                }
            }

            localStorage.setItem('tasks', JSON.stringify(tasks));
            closeModal();
            renderTasks();
            updateStats();
            updateChart();
            renderCalendar();
        });

// Render tasks
function renderTasks() {
    const sortOption = document.getElementById('sortTasks')?.value || 'none';
    const taskList = document.getElementById('taskList');
    const filterCategory = document.getElementById('filterCategory').value;
    const searchText = document.getElementById('searchTask').value.toLowerCase();

    let filteredTasks = tasks;
    if (filterCategory !== 'all') {
        filteredTasks = filteredTasks.filter(task => task.category === filterCategory);
    }
    if (searchText) {
        filteredTasks = filteredTasks.filter(task => 
            task.title.toLowerCase().includes(searchText) || 
            task.description.toLowerCase().includes(searchText)
        );
    }

    // Önceliğe göre sıralama
    if (sortOption === 'priority-asc') {
        filteredTasks.sort((a, b) => {
            const priorityA = a.priority === 'High' ? 1 : a.priority === 'Medium' ? 2 : 3;
            const priorityB = b.priority === 'High' ? 1 : b.priority === 'Medium' ? 2 : 3;
            return priorityA - priorityB;
        });
    } else if (sortOption === 'priority-desc') {
        filteredTasks.sort((a, b) => {
            const priorityA = a.priority === 'High' ? 1 : a.priority === 'Medium' ? 2 : 3;
            const priorityB = b.priority === 'High' ? 1 : b.priority === 'Medium' ? 2 : 3;
            return priorityB - priorityA;
        });
    }

    // Tarihe göre sıralama
    if (sortOption === 'date-asc') {
        filteredTasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    } else if (sortOption === 'date-desc') {
        filteredTasks.sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate));
    }

    taskList.innerHTML = filteredTasks.map(task => {
        const dueDateTime = new Date(task.dueDate);
        const formattedDateTime = dueDateTime.toLocaleString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        return `
        <li class="flex justify-between items-center p-2 border-b ${task.completed ? 'bg-gray-100' : ''} 
            priority-${task.priority.toLowerCase()}">
            <div class="flex items-center space-x-2">
                <input type="checkbox" ${task.completed ? 'checked' : ''}
                       onchange="toggleTaskComplete(${task.id})"
                       class="w-4 h-4 text-blue-600">
                <div class="${task.completed ? 'line-through text-gray-500' : ''}">
                    <div class="flex items-center">
                        <h3 class="font-bold">${task.title}</h3>
                        ${!task.completed ? getTimeIndicator(task.dueDate) : ''}
                    </div>
                    <p class="text-sm text-gray-600">Category: ${task.category}</p>
                    <p class="text-sm text-gray-600">Date: ${formattedDateTime}</p>
                    <p class="text-sm text-gray-600">Priority: ${task.priority}</p>
                    <p class="text-sm text-gray-600">Estimated Time: ${task.estimatedTime} hours</p>
                    ${task.isRecurring ? `
                    <p class="text-sm text-blue-600">
                        <i class="fas fa-sync-alt"></i> 
                        ${task.recurringType.charAt(0).toUpperCase() + task.recurringType.slice(1)} tekrar
                    </p>
                    ` : ''}
                    <p class="text-sm text-gray-600">${task.description}</p>
                </div>
            </div>
            <div class="flex space-x-2">
                <button onclick="openModal(${task.id})" 
                        class="text-blue-500 hover:text-blue-700">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteTask(${task.id})"
                        class="text-red-500 hover:text-red-700">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </li>
        `;
    }).join('');
}
        document.getElementById('sortTasks').addEventListener('change', renderTasks);

        // Toggle task completion
function toggleTaskComplete(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        if (task.completed) {
            task.completedDate = new Date().toISOString();
            addToTaskHistory(task); // Geçmişe ekle
        } else {
            removeFromTaskHistory(taskId); // Geçmişten kaldır

        }
        localStorage.setItem('tasks', JSON.stringify(tasks)); // Güncellenmiş görevleri localStorage'a kaydet
        renderTasks();
        updateStats();
        updateChart();
        renderCalendar();
    }
}

function addToTaskHistory(task) {
    const taskHistory = JSON.parse(localStorage.getItem('taskHistory')) || [];
    taskHistory.push({
        id: task.id,
        title: task.title,
        completedDate: task.completedDate // Tamamlanma tarihini ekle
    });
    localStorage.setItem('taskHistory', JSON.stringify(taskHistory)); // Güncellenmiş geçmişi localStorage'a kaydet

    const taskHistoryList = document.getElementById('taskHistory');
    const taskItem = document.createElement('li');
    taskItem.classList.add('flex', 'justify-between', 'items-center', 'p-2', 'border-b');
    taskItem.innerHTML = `
        <div class="flex items-center space-x-2">
            <div>
                <h3 class="font-bold">${task.title}</h3>
                <p class="text-sm text-gray-600">Completed on: ${new Date(task.completedDate).toLocaleDateString()}</p>
            </div>
        </div>
        <div class="flex space-x-2">
            <button onclick="deleteTaskHistory(${task.id})" class="text-red-500 hover:text-red-700">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    taskHistoryList.appendChild(taskItem);
}

function removeFromTaskHistory(taskId) {
    const taskHistory = JSON.parse(localStorage.getItem('taskHistory')) || [];
    const updatedTaskHistory = taskHistory.filter(task => task.id !== taskId);
    localStorage.setItem('taskHistory', JSON.stringify(updatedTaskHistory));
    
    // Görevi geçmiş listesinden DOM'dan da kaldır
    const taskHistoryList = document.getElementById('taskHistory');
    const taskItems = taskHistoryList.getElementsByTagName('li');
    
    for (let i = 0; i < taskItems.length; i++) {
        const taskItem = taskItems[i];
        const taskTitle = taskItem.querySelector('h3').textContent;
        
        // Eğer başlık eşleşiyorsa, DOM'dan kaldır
        if (taskTitle === tasks.find(t => t.id === taskId).title) {
            taskHistoryList.removeChild(taskItem);
            break; // İlk eşleşmeyi bulduktan sonra döngüyü kır
        }
    }
}

        
        // Görev geçmişindeki bir görevi sil
        function deleteTaskHistory(taskId) {
            if (confirm('Are you sure you want to delete this task from history?')) {
                removeFromTaskHistory(taskId);
                // Eğer görev, tasks dizisinde de varsa, onu da silin
                tasks = tasks.filter(task => task.id !== taskId);
                localStorage.setItem('tasks', JSON.stringify(tasks));
                renderTasks();
                updateStats();
                updateChart();
                renderCalendar();
            }
        }
        
        // Delete task
        function deleteTask(taskId) {
            if (confirm('Are you sure you want to delete this task?')) {
                tasks = tasks.filter(task => task.id !== taskId);
                localStorage.setItem('tasks', JSON.stringify(tasks));
                renderTasks();
                updateStats();
                updateChart();
                renderCalendar();
            }
        }

function updateStats() {
    const completedTasks = tasks.filter(task => task.completed);
    const pendingTasks = tasks.filter(task => !task.completed);
    const today = new Date();
    today.setDate(today.getDate() - 1);

    const overdueTasks = tasks.filter(task => 
        !task.completed && new Date(task.dueDate) < today 
    );

    document.getElementById('completedTaskCount').textContent = completedTasks.length;
    document.getElementById('pendingTaskCount').textContent = pendingTasks.length;
    document.getElementById('overdueTaskCount').textContent = overdueTasks.length;

    const completionRate = tasks.length > 0 
        ? Math.round((completedTasks.length / tasks.length) * 100)
        : 0;
    document.getElementById('completionRate').textContent = `${completionRate}%`;
    document.getElementById('completionProgress').style.width = `${completionRate}%`;
}

        // Update chart
let taskChart; // Grafiği saklamak için bir değişken tanımlayın

function updateChart() {
    const completedTasks = tasks.filter(task => task.completed).length;
    const pendingTasks = tasks.filter(task => !task.completed).length;
    const today = new Date();
    today.setDate(today.getDate() - 1);
    const overdueTasks = tasks.filter(task => 
        !task.completed && new Date(task.dueDate) < today
    ).length;

    const ctx = document.getElementById('taskChart').getContext('2d');

    // Eğer grafik zaten varsa, yok et
    if (taskChart) {
        taskChart.destroy();
    }

    // Yeni grafik oluştur
    taskChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['✔️ Completed Tasks', '⏳ Pending Tasks', '⚠️ Overdue Tasks'],
            datasets: [{
                data: [completedTasks, pendingTasks, overdueTasks],
                backgroundColor: ['#4CAF50', '#FFC107', '#F44336'],
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
        }
    });
}

        // Event listeners
        document.getElementById('desktopAddTaskBtn').addEventListener('click', () => openModal());
        document.getElementById('mobileAddTaskBtn').addEventListener('click', () => openModal());
        document.getElementById('filterCategory').addEventListener('change', renderTasks);
        document.getElementById('searchTask').addEventListener('input', renderTasks);

        // Calendar operations
        let currentMonth = new Date().getMonth();
        let currentYear = new Date().getFullYear();

        function renderCalendar() {
            const calendar = document.getElementById('calendar');
            const currentDate = new Date(currentYear, currentMonth);
            const firstDay = new Date(currentYear, currentMonth, 1).getDay();
            const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

            document.getElementById('currentMonthYear').textContent = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

            calendar.innerHTML = '';

            // Day names
            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            dayNames.forEach(day => {
                const dayNameCell = document.createElement('div');
                dayNameCell.textContent = day;
                dayNameCell.classList.add('text-center', 'font-semibold', 'p-2', 'bg-gray-200');
                calendar.appendChild(dayNameCell);
            });

            // Empty cells
            for (let i = 0; i < firstDay; i++) {
                const emptyCell = document.createElement('div');
                calendar.appendChild(emptyCell);
            }

            // Day cells
            for (let day = 1; day <= daysInMonth; day++) {
                const dayCell = document.createElement('div');
                dayCell.textContent = day;
                dayCell.classList.add('text-center', 'p-2', 'border', 'rounded', 'hover:bg-gray-200', 'cursor-pointer');
                
                // Show tasks in day cells
                const tasksForDay = tasks.filter(task => new Date(task.dueDate).getDate() === day && new Date(task.dueDate).getMonth() === currentMonth && new Date(task.dueDate).getFullYear() === currentYear);
                if (tasksForDay.length > 0) {
                    const taskList = document.createElement('ul');
                    taskList.classList.add('text-xs', 'text-left', 'mt-1');
                    tasksForDay.forEach(task => {
                        const taskItem = document.createElement('li');
                        taskItem.textContent = task.title;
                        taskItem.classList.add('truncate');
                        taskList.appendChild(taskItem);
                    });
                    dayCell.appendChild(taskList);
                }

                dayCell.addEventListener('click', () => {
                    renderTasksForSelectedDay(day);
                });
                calendar.appendChild(dayCell);
            }
        }
function renderTasksForSelectedDay(selectedDay) {
    const taskList = document.getElementById('taskList');
    const selectedTasks = tasks.filter(task => {
        const taskDate = new Date(task.dueDate);
        return taskDate.getDate() === selectedDay && taskDate.getMonth() === currentMonth && taskDate.getFullYear() === currentYear;
    });

    taskList.innerHTML = selectedTasks.map(task => `
        <li class="flex justify-between items-center p-2 border-b ${task.completed ? 'bg-gray-100' : ''}">
            <div class="flex items-center space-x-2">
            <div class="flex items-center space-x-2">
                <input type="checkbox" ${task.completed ? 'checked' : ''}
                       onchange="toggleTaskComplete(${task.id})"
                       class="w-4 h-4 text-blue-600">
                <div class="${task.completed ? 'line-through text-gray-500' : ''}">
                    <h3 class="font-bold">${task.title}</h3>
                    <p class="text-sm text-gray-600">Category: ${task.category}</p>
                    <p class="text-sm text-gray-600">Date: ${task.dueDate}</p>
                    <p class="text-sm text-gray-600">Priority: ${task.priority}</p>
                    <p class="text-sm text-gray-600">Estimated Time: ${task.estimatedTime} hours</p>
                    <p class="text-sm text-gray-600">${task.description}</p>
                </div>
            </div>
            <div class="flex space-x-2">
                <button onclick="openModal(${task.id})" 
                        class="text-blue-500 hover:text-blue-700">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteTask(${task.id})"
                        class="text-red-500 hover:text-red-700">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </li>
    `).join('');
}
        document.getElementById('prevMonth').addEventListener('click', () => {
            currentMonth--;
            if (currentMonth < 0) {
                currentMonth = 11;
                currentYear--;
            }
            renderCalendar();
        });

        document.getElementById('nextMonth').addEventListener('click', () => {
            currentMonth++;
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            }
            renderCalendar();
        });

let isDarkMode = localStorage.getItem('darkMode') === 'true';


document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.toggle('dark-mode', isDarkMode);
    document.getElementById('desktopThemeToggle').textContent = isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode';
    document.getElementById('mobileThemeToggle').textContent = isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode';
});
document.getElementById('desktopThemeToggle').addEventListener('click', () => {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark-mode', isDarkMode);
    document.getElementById('desktopThemeToggle').textContent = isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode';
    localStorage.setItem('darkMode', isDarkMode);
});

document.getElementById('mobileThemeToggle').addEventListener('click', () => {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark-mode', isDarkMode);
    document.getElementById('mobileThemeToggle').textContent = isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode';
    localStorage.setItem('darkMode', isDarkMode);
});
function loadTaskHistory() {
    const taskHistory = JSON.parse(localStorage.getItem('taskHistory')) || [];
    const taskHistoryList = document.getElementById('taskHistory');
    taskHistoryList.innerHTML = ''; // Önceki öğeleri temizle

    taskHistory.forEach(task => {
        const taskItem = document.createElement('li');
        taskItem.classList.add('flex', 'justify-between', 'items-center', 'p-2', 'border-b');
        taskItem.innerHTML = `
            <div class="flex items-center space-x-2">
                <div>
                    <h3 class="font-bold">${task.title}</h3>
                    <p class="text-sm text-gray-600">Completed on: ${new Date(task.completedDate).toLocaleDateString()}</p>
                </div>
            </div>
            <div class="flex space-x-2">
                <button onclick="deleteTaskHistory(${task.id})" class="text-red-500 hover:text-red-700">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        taskHistoryList.appendChild(taskItem);
    });
}
        // Render calendar on page load
        window.addEventListener('DOMContentLoaded', () => {
            renderCalendar();
            renderTasks();
            updateStats();
            updateChart();
            loadTaskHistory();
        });

// Dosya seçici oluşturma fonksiyonu
function createFileInput() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    return input;
}

// Dosya seçim işleyicisi
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = handleFileRead;
    reader.readAsText(file);
}

// Dosya okuma işleyicisi
function handleFileRead(event) {
    try {
        const importedTasks = JSON.parse(event.target.result);
        
        if (Array.isArray(importedTasks)) {
            importTasks(importedTasks);
            showSuccessMessage();
        } else {
            throw new Error('Geçersiz dosya formatı');
        }
    } catch (error) {
        showErrorMessage();
    }
}

// Görevleri içe aktarma
function importTasks(importedTasks) {
    tasks = tasks.concat(importedTasks);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    updateUI();
}

// Arayüz güncelleme
function updateUI() {
    renderTasks();
    updateStats();
    updateChart();
}

// Mesaj gösterme fonksiyonları
function showSuccessMessage() {
    alert('Görevler başarıyla içe aktarıldı!');
}

function showErrorMessage() {
    alert('Görevleri içe aktarırken hata oluştu. Lütfen geçerli bir JSON dosyası yükleyin.');
}

// Tekrar eden görevleri oluşturan fonksiyon
function createRecurringTasks(baseTask) {
    const startDate = new Date(baseTask.dueDate);
    const endDate = baseTask.recurringEndDate ? new Date(baseTask.recurringEndDate) : null;
    let currentDate = new Date(startDate);
    
    // İlk görevi ekle
    tasks.push({...baseTask});
    
    // Tekrar eden görevleri oluştur
    while (!endDate || currentDate < endDate) {
        let nextDate = new Date(currentDate);
        
        switch(baseTask.recurringType) {
            case 'daily':
                nextDate.setDate(nextDate.getDate() + baseTask.recurringInterval);
                break;
            case 'weekly':
                nextDate.setDate(nextDate.getDate() + (7 * baseTask.recurringInterval));
                break;
            case 'monthly':
                nextDate.setMonth(nextDate.getMonth() + baseTask.recurringInterval);
                break;
            case 'yearly':
                nextDate.setFullYear(nextDate.getFullYear() + baseTask.recurringInterval);
                break;
        }
        
        if (endDate && nextDate > endDate) break;
        
        currentDate = nextDate;
        const newTask = {
            ...baseTask,
            id: Date.now() + Math.random(),
            dueDate: currentDate.toISOString().split('T')[0],
            completed: false
        };
        tasks.push(newTask);
    }
}

// Tekrar seçeneklerini göster/gizle
document.getElementById('taskRecurring').addEventListener('change', function(e) {
    const recurringOptions = document.getElementById('recurringOptions');
    recurringOptions.classList.toggle('hidden', !e.target.checked);
});

// Süre hesaplama fonksiyonu
function getTimeIndicator(dueDateTime) {
    const now = new Date();
    const due = new Date(dueDateTime);
    const diffTime = due - now;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    let timeText = '';
    let timeClass = '';
    
    if (diffTime < 0) {
        const overdueDays = Math.abs(diffDays);
        const overdueHours = Math.abs(diffHours);
        if (overdueDays > 0) {
            timeText = `${overdueDays} gün ${overdueHours} saat gecikti`;
        } else {
            timeText = `${overdueHours} saat gecikti`;
        }
        timeClass = 'time-urgent';
    } else if (diffDays === 0) {
        if (diffHours <= 3) {
            timeText = `${diffHours} saat kaldı`;
            timeClass = 'time-urgent';
        } else {
            timeText = `Bugün - ${diffHours} saat kaldı`;
            timeClass = 'time-warning';
        }
    } else if (diffDays === 1) {
        timeText = `Yarın - ${diffHours} saat kaldı`;
        timeClass = 'time-warning';
    } else if (diffDays <= 3) {
        timeText = `${diffDays} gün ${diffHours} saat kaldı`;
        timeClass = 'time-warning';
    } else {
        timeText = `${diffDays} gün ${diffHours} saat kaldı`;
        timeClass = 'time-normal';
    }
    
    return `<span class="time-indicator ${timeClass}">${timeText}</span>`;
}

// Günlük Notlar özelliği
const dailyNotesBtn = document.getElementById('dailyNotesBtn');
const dailyNotesPanel = document.getElementById('dailyNotesPanel');
const noteDate = document.getElementById('noteDate');
const dailyNoteText = document.getElementById('dailyNoteText');
const addNoteBtn = document.getElementById('addNoteBtn');
const notesList = document.getElementById('notesList');
const saveDailyNote = document.getElementById('saveDailyNote');
const noteSavedMsg = document.getElementById('noteSavedMsg');

// Paneli aç/kapat
if (dailyNotesBtn) {
    dailyNotesBtn.addEventListener('click', () => {
        // Diğer panelleri gizle
        document.querySelectorAll('main > section').forEach(sec => sec.classList.add('hidden'));
        dailyNotesPanel.classList.remove('hidden');
        // Tarih alanı bugünün tarihi olsun
        noteDate.value = new Date().toISOString().slice(0, 10);
        loadDailyNote();
    });
}

function getNotesForDate(date) {
    const notes = JSON.parse(localStorage.getItem('dailyNotesV2') || '{}');
    return notes[date] || [];
}

function saveNotesForDate(date, notesArr) {
    const notes = JSON.parse(localStorage.getItem('dailyNotesV2') || '{}');
    notes[date] = notesArr;
    localStorage.setItem('dailyNotesV2', JSON.stringify(notes));
}

function renderNotes() {
    const date = noteDate.value;
    const notesArr = getNotesForDate(date);
    notesList.innerHTML = '';
    notesArr.forEach((note, idx) => {
        const li = document.createElement('li');
        li.className = 'flex items-center justify-between bg-gray-100 rounded px-2 py-1';
        li.innerHTML = `<span class="break-all">${note}</span>
            <button class="text-red-500 hover:text-red-700 ml-2" title="Delete note" data-idx="${idx}">
                <i class="fas fa-minus"></i>
            </button>`;
        notesList.appendChild(li);
    });
}

if (noteDate) {
    noteDate.value = new Date().toISOString().slice(0, 10);
    noteDate.addEventListener('change', renderNotes);
    renderNotes();
}

if (addNoteBtn) {
    addNoteBtn.addEventListener('click', () => {
        const date = noteDate.value;
        const text = dailyNoteText.value.trim();
        if (!text) return;
        const notesArr = getNotesForDate(date);
        notesArr.push(text);
        saveNotesForDate(date, notesArr);
        dailyNoteText.value = '';
        renderNotes();
    });
}

if (notesList) {
    notesList.addEventListener('click', (e) => {
        if (e.target.closest('button')) {
            const idx = e.target.closest('button').dataset.idx;
            const date = noteDate.value;
            let notesArr = getNotesForDate(date);
            notesArr.splice(idx, 1);
            saveNotesForDate(date, notesArr);
            renderNotes();
        }
    });
}

// Günlük notları yükle
function loadDailyNote() {
    const notes = JSON.parse(localStorage.getItem('dailyNotes') || '{}');
    const date = noteDate.value;
    dailyNoteText.value = notes[date] || '';
    noteSavedMsg.classList.add('hidden');
}

if (saveDailyNote) {
    saveDailyNote.addEventListener('click', () => {
        const notes = JSON.parse(localStorage.getItem('dailyNotes') || '{}');
        const date = noteDate.value;
        notes[date] = dailyNoteText.value;
        localStorage.setItem('dailyNotes', JSON.stringify(notes));
        noteSavedMsg.classList.remove('hidden');
        setTimeout(() => noteSavedMsg.classList.add('hidden'), 1500);
    });
}