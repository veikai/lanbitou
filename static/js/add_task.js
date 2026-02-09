// 添加任务逻辑
document.addEventListener('DOMContentLoaded', function() {
    const addTaskForm = document.getElementById('addTaskForm');
    const cancelBtn = document.getElementById('cancelBtn');
    const successMessage = document.getElementById('successMessage');

    // 设置默认截止日期为明天
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    document.getElementById('deadline').value = tomorrow.toISOString().slice(0, 16);

    // 绑定事件
    addTaskForm.addEventListener('submit', handleSubmit);
    cancelBtn.addEventListener('click', () => window.location.href = '/tasks');
});

// 处理表单提交
async function handleSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;

    try {
        // 禁用提交按钮
        submitButton.disabled = true;
        submitButton.textContent = '创建中...';

        // 收集表单数据
        const formData = {
            title: document.getElementById('title').value.trim(),
            description: document.getElementById('description').value.trim() || undefined,
            deadline: document.getElementById('deadline').value || undefined,
            priority: parseInt(document.getElementById('priority').value)
        };

        // 验证标题
        if (!formData.title) {
            throw new Error('标题不能为空');
        }

        // 转换截止日期格式
        if (formData.deadline) {
            formData.deadline = new Date(formData.deadline).toISOString();
        }

        // 发送请求
        const response = await fetch('/api/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `创建失败: ${response.status}`);
        }

        // 显示成功消息
        showSuccessMessage();

    } catch (error) {
        console.error('创建任务失败:', error);
        alert(`创建失败: ${error.message}`);
    } finally {
        // 恢复提交按钮
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
    }
}

// 显示成功消息
function showSuccessMessage() {
    // 隐藏表单
    document.getElementById('addTaskForm').classList.add('hidden');
    // 显示成功消息
    document.getElementById('successMessage').classList.remove('hidden');
}

// 重置表单（从成功消息调用）
window.resetForm = function() {
    // 显示表单
    document.getElementById('addTaskForm').classList.remove('hidden');
    // 隐藏成功消息
    document.getElementById('successMessage').classList.add('hidden');
    // 重置表单
    document.getElementById('addTaskForm').reset();
    // 设置默认截止日期为明天
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    document.getElementById('deadline').value = tomorrow.toISOString().slice(0, 16);
};