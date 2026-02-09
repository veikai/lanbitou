// 坐标图主逻辑
document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('coordinateCanvas');
    const ctx = canvas.getContext('2d');
    const taskDetails = document.getElementById('taskDetails');
    const refreshBtn = document.getElementById('refreshBtn');
    const showDeadlineCheckbox = document.getElementById('showDeadline');
    const showTitleCheckbox = document.getElementById('showTitle');

    let tasks = [];
    let taskPoints = []; // 存储任务点的坐标和任务引用
    let canvasWidth = canvas.width;
    let canvasHeight = canvas.height;

    // 坐标轴参数
    const margin = { top: 40, right: 40, bottom: 80, left: 80 };
    let graphWidth = canvasWidth - margin.left - margin.right;
    let graphHeight = canvasHeight - margin.top - margin.bottom;

    // 紧急程度范围（天数）：过去30天到未来30天
    const urgencyRange = { min: -30, max: 30 };
    // 重要程度范围（优先级）：1-5
    const priorityRange = { min: 1, max: 5 };

    // 颜色映射：根据优先级（5最重要，1最不重要）
    const priorityColors = {
        5: '#e74c3c', // 红色 - 最高优先级
        4: '#f39c12', // 橙色
        3: '#f1c40f', // 黄色
        2: '#2ecc71', // 绿色
        1: '#3498db'  // 蓝色 - 最低优先级
    };

    // 初始化
    function init() {
        // 调整Canvas大小
        resizeCanvas();
        // 加载任务数据
        loadTasks();
        // 绑定事件
        refreshBtn.addEventListener('click', loadTasks);
        showDeadlineCheckbox.addEventListener('change', draw);
        showTitleCheckbox.addEventListener('change', draw);
        window.addEventListener('resize', resizeCanvas);

        // Canvas事件委托
        canvas.addEventListener('click', handleCanvasClick);
        canvas.addEventListener('mousemove', handleCanvasMouseMove);
    }

    // 调整Canvas大小
    function resizeCanvas() {
        const container = canvas.parentElement;
        canvasWidth = container.clientWidth;
        canvasHeight = 550; // 固定高度
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        // 更新图形尺寸
        graphWidth = canvasWidth - margin.left - margin.right;
        graphHeight = canvasHeight - margin.top - margin.bottom;
        draw();
    }

    // 加载任务数据
    async function loadTasks() {
        try {
            const response = await fetch('/api/tasks');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            tasks = data.tasks.map(task => ({
                ...task,
                // 解析日期字符串为Date对象
                deadline: task.deadline ? new Date(task.deadline) : null,
                created_at: new Date(task.created_at),
                updated_at: new Date(task.updated_at),
                // 计算紧急程度（距离现在的天数）
                urgency: calculateUrgency(task.deadline)
            }));
            draw();
        } catch (error) {
            console.error('加载任务失败:', error);
            taskDetails.innerHTML = `<div class="error">加载任务失败: ${error.message}</div>`;
        }
    }

    // 计算紧急程度（天数）
    function calculateUrgency(deadlineString) {
        if (!deadlineString) return 0; // 没有截止日期设为0

        const deadline = new Date(deadlineString);
        const now = new Date();
        const diffTime = deadline - now;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        // 限制在范围内
        return Math.max(urgencyRange.min, Math.min(urgencyRange.max, diffDays));
    }

    // 绘制坐标图
    function draw() {
        // 清除Canvas
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        // 绘制坐标轴
        drawAxes();

        // 绘制网格
        drawGrid();

        // 清空任务点数组
        taskPoints = [];
        // 绘制任务点
        drawTasks();
    }

    // 绘制坐标轴
    function drawAxes() {
        ctx.save();
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.fillStyle = '#555';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';

        // Y轴（重要程度）
        ctx.beginPath();
        ctx.moveTo(margin.left, margin.top);
        ctx.lineTo(margin.left, margin.top + graphHeight);
        ctx.stroke();

        // X轴（紧急程度）
        ctx.beginPath();
        ctx.moveTo(margin.left, margin.top + graphHeight);
        ctx.lineTo(margin.left + graphWidth, margin.top + graphHeight);
        ctx.stroke();

        // Y轴标签
        ctx.save();
        ctx.translate(margin.left - 40, margin.top + graphHeight / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('重要程度（优先级）', 0, 0);
        ctx.restore();

        // X轴标签
        ctx.fillText('紧急程度（天数）', margin.left + graphWidth / 2, margin.top + graphHeight + 40);

        // Y轴刻度
        ctx.textAlign = 'right';
        for (let priority = priorityRange.min; priority <= priorityRange.max; priority++) {
            const y = margin.top + graphHeight - ((priority - priorityRange.min) / (priorityRange.max - priorityRange.min)) * graphHeight;

            // 刻度线
            ctx.beginPath();
            ctx.moveTo(margin.left - 5, y);
            ctx.lineTo(margin.left + 5, y);
            ctx.stroke();

            // 刻度标签
            ctx.fillText(priority.toString(), margin.left - 10, y + 4);
        }
        ctx.textAlign = 'center';

        // X轴刻度
        const urgencySteps = 6;
        for (let i = 0; i <= urgencySteps; i++) {
            const urgency = urgencyRange.min + (i / urgencySteps) * (urgencyRange.max - urgencyRange.min);
            const x = margin.left + (i / urgencySteps) * graphWidth;

            // 刻度线
            ctx.beginPath();
            ctx.moveTo(x, margin.top + graphHeight - 5);
            ctx.lineTo(x, margin.top + graphHeight + 5);
            ctx.stroke();

            // 刻度标签
            ctx.fillText(urgency.toFixed(0), x, margin.top + graphHeight + 20);
        }

        ctx.restore();
    }

    // 绘制网格
    function drawGrid() {
        ctx.save();
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 1;

        // 水平网格线（对应优先级）
        for (let priority = priorityRange.min; priority <= priorityRange.max; priority++) {
            const y = margin.top + graphHeight - ((priority - priorityRange.min) / (priorityRange.max - priorityRange.min)) * graphHeight;
            ctx.beginPath();
            ctx.moveTo(margin.left, y);
            ctx.lineTo(margin.left + graphWidth, y);
            ctx.stroke();
        }

        // 垂直网格线（对应紧急程度）
        const urgencySteps = 12;
        for (let i = 0; i <= urgencySteps; i++) {
            const x = margin.left + (i / urgencySteps) * graphWidth;
            ctx.beginPath();
            ctx.moveTo(x, margin.top);
            ctx.lineTo(x, margin.top + graphHeight);
            ctx.stroke();
        }

        ctx.restore();
    }

    // 绘制任务点
    function drawTasks() {
        tasks.forEach((task, index) => {
            // 计算坐标
            const x = margin.left + ((task.urgency - urgencyRange.min) / (urgencyRange.max - urgencyRange.min)) * graphWidth;
            const y = margin.top + graphHeight - ((task.priority - priorityRange.min) / (priorityRange.max - priorityRange.min)) * graphHeight;

            // 保存任务点坐标供事件委托使用
            taskPoints.push({ x, y, task });

            // 绘制点
            ctx.save();
            ctx.fillStyle = priorityColors[task.priority] || '#3498db';
            ctx.beginPath();
            ctx.arc(x, y, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();

            // 显示任务标题（如果启用）
            if (showTitleCheckbox.checked) {
                ctx.fillStyle = '#333';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(task.title, x, y - 15);
            }

            // 显示截止日期（如果启用且存在）
            if (showDeadlineCheckbox.checked && task.deadline) {
                ctx.fillStyle = '#666';
                ctx.font = '11px Arial';
                ctx.textAlign = 'center';
                const deadlineStr = formatDate(task.deadline);
                ctx.fillText(deadlineStr, x, y + 25);
            }

            ctx.restore();
        });
    }

    // 处理Canvas点击
    function handleCanvasClick(event) {
        const rect = canvas.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const clickY = event.clientY - rect.top;

        // 查找点击的任务点
        for (const point of taskPoints) {
            const distance = Math.sqrt(Math.pow(clickX - point.x, 2) + Math.pow(clickY - point.y, 2));
            if (distance <= 10) {
                showTaskDetails(point.task);
                break;
            }
        }
    }

    // 处理Canvas鼠标移动
    function handleCanvasMouseMove(event) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        let hovered = false;
        for (const point of taskPoints) {
            const distance = Math.sqrt(Math.pow(mouseX - point.x, 2) + Math.pow(mouseY - point.y, 2));
            if (distance <= 10) {
                canvas.style.cursor = 'pointer';
                drawTaskHover(point.task, point.x, point.y);
                hovered = true;
                break;
            }
        }

        if (!hovered) {
            canvas.style.cursor = 'default';
        }
    }

    // 绘制任务悬停效果
    function drawTaskHover(task, x, y) {
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.beginPath();
        ctx.arc(x, y, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    // 显示任务详情
    function showTaskDetails(task) {
        const deadlineStr = task.deadline ? formatDate(task.deadline) : '未设置';
        const urgencyText = task.urgency > 0 ? `${task.urgency}天后` : task.urgency < 0 ? `${Math.abs(task.urgency)}天前` : '今天';
        const priorityText = `优先级 ${task.priority}/5`;

        let priorityClass = '';
        if (task.priority >= 4) priorityClass = 'high-priority';      // 5,4
        else if (task.priority >= 2) priorityClass = 'medium-priority'; // 3,2
        else priorityClass = 'low-priority';                           // 1

        taskDetails.innerHTML = `
            <div class="task-info">
                <h4>${task.title}</h4>
                <p><strong>描述：</strong>${task.description || '无描述'}</p>
                <p><strong>截止日期：</strong>${deadlineStr} (${urgencyText})</p>
                <p><strong>重要程度：</strong><span class="${priorityClass}">${priorityText}</span></p>
                <p><strong>创建时间：</strong>${formatDate(task.created_at)}</p>
                <p><strong>最后更新：</strong>${formatDate(task.updated_at)}</p>
                <div class="task-actions">
                    <button onclick="editTask(${task.id})">编辑</button>
                    <button onclick="deleteTask(${task.id})">删除</button>
                </div>
            </div>
        `;
    }

    // 格式化日期
    function formatDate(date) {
        if (!date) return '';
        const d = new Date(date);
        return d.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // 编辑任务（占位函数）
    window.editTask = function(taskId) {
        alert(`编辑任务 ${taskId} - 此功能待实现`);
        // 可以跳转到编辑页面或打开模态框
    };

    // 删除任务（占位函数）
    window.deleteTask = function(taskId) {
        if (confirm('确定要删除这个任务吗？')) {
            fetch(`/api/tasks/${taskId}`, { method: 'DELETE' })
                .then(response => {
                    if (response.ok) {
                        alert('任务删除成功');
                        loadTasks();
                    } else {
                        alert('删除失败');
                    }
                })
                .catch(error => {
                    console.error('删除失败:', error);
                    alert('删除失败');
                });
        }
    };

    // 启动应用
    init();
});