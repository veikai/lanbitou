// 任务列表逻辑
document.addEventListener('DOMContentLoaded', function() {
    const tasksTableBody = document.getElementById('tasksTableBody');
    const loadingElement = document.getElementById('loading');
    const noTasksElement = document.getElementById('noTasks');
    const searchInput = document.getElementById('searchInput');
    const priorityFilter = document.getElementById('priorityFilter');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const pageInfo = document.getElementById('pageInfo');
    const createTaskBtn = document.getElementById('createTaskBtn');
    const editModal = document.getElementById('editModal');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const editTaskForm = document.getElementById('editTaskForm');

    // 分页状态
    let currentPage = 1;
    let totalTasks = 0;
    const limit = 20;

    // 初始化
    function init() {
        loadTasks();
        bindEvents();
    }

    // 绑定事件
    function bindEvents() {
        searchInput.addEventListener('input', debounce(loadTasks, 300));
        priorityFilter.addEventListener('change', loadTasks);
        prevBtn.addEventListener('click', () => changePage(-1));
        nextBtn.addEventListener('click', () => changePage(1));
        createTaskBtn.addEventListener('click', () => window.location.href = '/tasks/new');
        cancelEditBtn.addEventListener('click', () => editModal.classList.add('hidden'));
        editTaskForm.addEventListener('submit', handleEditSubmit);
    }

    // 加载任务
    async function loadTasks() {
        try {
            showLoading(true);

            const search = searchInput.value.trim();
            const priority = priorityFilter.value;

            let url = `/api/tasks?skip=${(currentPage - 1) * limit}&limit=${limit}`;
            if (search) url += `&search=${encodeURIComponent(search)}`;
            if (priority) url += `&priority=${priority}`;

            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const data = await response.json();
            totalTasks = data.total;
            renderTasks(data.tasks);
            updatePagination();
        } catch (error) {
            console.error('加载任务失败:', error);
            tasksTableBody.innerHTML = `<tr><td colspan="6" class="error">加载失败: ${error.message}</td></tr>`;
        } finally {
            showLoading(false);
        }
    }

    // 渲染任务表格
    function renderTasks(tasks) {
        if (tasks.length === 0) {
            tasksTableBody.innerHTML = '';
            noTasksElement.classList.remove('hidden');
            return;
        }

        noTasksElement.classList.add('hidden');

        const rows = tasks.map(task => {
            const deadlineStr = task.deadline ? formatDate(task.deadline) : '未设置';
            const createdStr = formatDate(task.created_at);
            const priorityClass = `priority-${task.priority}`;

            return `
                <tr>
                    <td><strong>${escapeHtml(task.title)}</strong></td>
                    <td>${escapeHtml(task.description || '')}</td>
                    <td>${deadlineStr}</td>
                    <td><span class="priority-badge ${priorityClass}">优先级 ${task.priority}</span></td>
                    <td>${createdStr}</td>
                    <td class="actions">
                        <button onclick="editTask(${task.id})" class="edit-btn">编辑</button>
                        <button onclick="deleteTask(${task.id})" class="delete-btn">删除</button>
                    </td>
                </tr>
            `;
        }).join('');

        tasksTableBody.innerHTML = rows;
    }

    // 显示/隐藏加载状态
    function showLoading(isLoading) {
        if (isLoading) {
            loadingElement.classList.remove('hidden');
            tasksTableBody.innerHTML = '';
        } else {
            loadingElement.classList.add('hidden');
        }
    }

    // 更新分页控件
    function updatePagination() {
        const totalPages = Math.ceil(totalTasks / limit);

        prevBtn.disabled = currentPage <= 1;
        nextBtn.disabled = currentPage >= totalPages;

        pageInfo.textContent = `第 ${currentPage} 页，共 ${totalPages} 页`;
    }

    // 切换页面
    function changePage(delta) {
        const newPage = currentPage + delta;
        const totalPages = Math.ceil(totalTasks / limit);

        if (newPage >= 1 && newPage <= totalPages) {
            currentPage = newPage;
            loadTasks();
        }
    }

    // 防抖函数
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // 格式化日期
    function formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // HTML转义
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // 启动
    init();
});

// 编辑任务（全局函数）
window.editTask = async function(taskId) {
    try {
        const response = await fetch(`/api/tasks/${taskId}`);
        if (!response.ok) throw new Error('加载任务失败');

        const task = await response.json();

        // 填充表单
        document.getElementById('editTaskId').value = task.id;
        document.getElementById('editTitle').value = task.title;
        document.getElementById('editDescription').value = task.description || '';

        if (task.deadline) {
            const deadlineDate = new Date(task.deadline);
            document.getElementById('editDeadline').value = deadlineDate.toISOString().slice(0, 16);
        } else {
            document.getElementById('editDeadline').value = '';
        }

        document.getElementById('editPriority').value = task.priority;

        // 显示模态框
        document.getElementById('editModal').classList.remove('hidden');
    } catch (error) {
        console.error('编辑任务失败:', error);
        alert('加载任务失败');
    }
};

// 处理编辑提交
async function handleEditSubmit(event) {
    event.preventDefault();

    const taskId = document.getElementById('editTaskId').value;
    const title = document.getElementById('editTitle').value.trim();
    const description = document.getElementById('editDescription').value.trim();
    const deadline = document.getElementById('editDeadline').value;
    const priority = parseInt(document.getElementById('editPriority').value);

    const taskData = {
        title: title || undefined,
        description: description || undefined,
        deadline: deadline ? new Date(deadline).toISOString() : undefined,
        priority: priority
    };

    // 移除undefined字段
    Object.keys(taskData).forEach(key => taskData[key] === undefined && delete taskData[key]);

    try {
        const response = await fetch(`/api/tasks/${taskId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(taskData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || '更新失败');
        }

        alert('任务更新成功');
        document.getElementById('editModal').classList.add('hidden');

        // 重新加载任务列表
        if (window.loadTasks) window.loadTasks();
        else location.reload();
    } catch (error) {
        console.error('更新任务失败:', error);
        alert(`更新失败: ${error.message}`);
    }
}

// 删除任务（全局函数）
window.deleteTask = function(taskId) {
    if (!confirm('确定要删除这个任务吗？')) return;

    fetch(`/api/tasks/${taskId}`, { method: 'DELETE' })
        .then(response => {
            if (response.ok) {
                alert('任务删除成功');
                if (window.loadTasks) window.loadTasks();
                else location.reload();
            } else {
                alert('删除失败');
            }
        })
        .catch(error => {
            console.error('删除失败:', error);
            alert('删除失败');
        });
};