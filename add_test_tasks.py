import requests
import json
from datetime import datetime, timedelta

BASE_URL = "http://localhost:5000/api/tasks"

def create_task(title, description, days_from_now, priority):
    """创建测试任务"""
    deadline = None
    if days_from_now is not None:
        deadline = datetime.utcnow() + timedelta(days=days_from_now)

    task_data = {
        "title": title,
        "description": description,
        "priority": priority
    }

    if deadline:
        task_data["deadline"] = deadline.isoformat() + "Z"

    response = requests.post(BASE_URL, json=task_data)
    if response.status_code == 201:
        print(f"创建成功: {title}")
        return response.json()
    else:
        print(f"创建失败 {title}: {response.status_code}")
        print(response.text)
        return None

def main():
    print("添加测试任务...")

    # 不同紧急程度和重要程度的任务
    tasks = [
        # 高优先级，紧急（未来1天）
        ("完成项目报告", "准备下周的项目汇报材料", 1, 1),
        # 高优先级，不紧急（未来30天）
        ("年度绩效评估", "准备年度绩效评估材料", 30, 1),
        # 中等优先级，紧急（过去5天）
        ("修复登录bug", "用户反馈登录页面有问题", -5, 3),
        # 中等优先级，中等紧急（未来10天）
        ("团队建设活动", "组织季度团队建设活动", 10, 3),
        # 低优先级，不紧急（未来60天，但会被截断到30天）
        ("学习新技术", "研究新的前端框架", 60, 5),
        # 低优先级，紧急（今天）
        ("回复客户邮件", "回复重要客户的咨询邮件", 0, 5),
        # 高优先级，中等紧急（未来7天）
        ("产品发布", "准备产品v2.0发布", 7, 2),
        # 中等优先级，不紧急（未来20天）
        ("更新文档", "更新项目技术文档", 20, 4),
        # 无截止日期，中等优先级
        ("日常代码审查", "定期进行团队代码审查", None, 3),
        # 无截止日期，高优先级
        ("安全漏洞修复", "修复发现的安全漏洞", None, 1),
    ]

    for title, desc, days, priority in tasks:
        create_task(title, desc, days, priority)

    print("测试任务添加完成")

if __name__ == "__main__":
    main()