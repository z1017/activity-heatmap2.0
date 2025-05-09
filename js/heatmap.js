document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('ahm-heatmap');
  if (!container) return;

  let currentYear = parseInt(container.dataset.year);
  let popupLock = false; // 用于控制点击锁定弹窗

  function fetchData(year) {
    fetch(`${ahmData.ajax_url}?action=ahm_get_data&year=${year}`)
      .then(res => res.json())
      .then(json => renderHeatmap(json.data, year));
  }

  function renderHeatmap(data, year) {
    container.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.className = 'ahm-wrapper';

    const heatmap = document.createElement('div');
    heatmap.className = 'heatmap-core';

    const weeks = [];
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31);
    const date = new Date(start);

    while (date.getDay() !== 0) date.setDate(date.getDate() - 1);

    while (date <= end) {
      const week = document.createElement('div');
      week.className = 'week';

      for (let i = 0; i < 7; i++) {
        const dateStr = date.toISOString().split('T')[0];
        const count = data[dateStr] || 0;
        const level = getLevel(count);

        const day = document.createElement('div');
        day.className = `day level-${level}`;
        // day.title = `${dateStr}: ${count} 篇`;

        // 鼠标悬停显示浮层
        // day.addEventListener('mouseenter', (e) => showPopup(dateStr, count, e.target));
        // day.addEventListener('mouseleave', () => removePopup());

        day.addEventListener('mouseenter', (e) => showPopup(dateStr, count, e.target));
        day.addEventListener('click', (e) => showPopup(dateStr, count, e.target, true));
        day.addEventListener('mouseleave', () => {
          if (!popupLock) removePopup();
        });




        week.appendChild(day);
        date.setDate(date.getDate() + 1);
      }

      weeks.push(week);
    }

    // 上方月份标签
    const monthLabels = document.createElement('div');
    monthLabels.className = 'months';
    for (let i = 0; i < 12; i++) {
      const label = document.createElement('span');
      label.innerText = `${i + 1}月`;
      monthLabels.appendChild(label);
    }

    // 左侧星期标签
    const weekdays = document.createElement('div');
    weekdays.className = 'weekdays';
    ['日', '二', '四'].forEach((w, i) => {
      const label = document.createElement('span');
      label.style.gridRow = `${i * 2 + 1} / span 1`;
      label.innerText = w;
      weekdays.appendChild(label);
    });

    // 右侧年份切换
    const yearSwitcher = document.createElement('div');
    yearSwitcher.className = 'year-switcher-vertical';
    yearSwitcher.innerHTML = `
      <button class="prev-year">${year - 1}</button>
      <strong class="current-year">${year}</strong>
      <button class="next-year">${year + 1}</button>
    `;
    yearSwitcher.querySelector('.prev-year').addEventListener('click', () => fetchData(year - 1));
    yearSwitcher.querySelector('.next-year').addEventListener('click', () => fetchData(year + 1));

    weeks.forEach(w => heatmap.appendChild(w));
    wrapper.appendChild(monthLabels);
    wrapper.appendChild(weekdays);
    wrapper.appendChild(heatmap);
    wrapper.appendChild(yearSwitcher);

    // 添加图例
    const legend = document.createElement('div');
    legend.className = 'legend';
    legend.innerHTML = `Less
      <span class="day level-0"></span>
      <span class="day level-1"></span>
      <span class="day level-2"></span>
      <span class="day level-3"></span>
      <span class="day level-4"></span>
      More`;

    container.appendChild(wrapper);
    container.appendChild(legend);
  }

  function getLevel(count) {
    if (count === 0) return 0;
    if (count === 1) return 1;
    if (count <= 3) return 2;
    if (count <= 5) return 3;
    return 4;
  }


  function showPopup(date, count, anchor, isClick = false) {
    removePopup();

    const popup = document.createElement('div');
    popup.className = 'ahm-popup';
    const link = `${location.origin}/${date.replace(/-/g, '/')}/`;
    popup.innerHTML = `
      <strong>${date}</strong><br>
      📖 更新 ${count} 篇文档<br>
      <a href="${link}" target="_blank">👉 阅读更多</a>
    `;
    document.body.appendChild(popup);

    const rect = anchor.getBoundingClientRect();
    popup.style.top = `${rect.top + window.scrollY - 10}px`;
    popup.style.left = `${rect.left + window.scrollX + 20}px`;

    // 点击时锁定 3 秒
    if (isClick) {
      popupLock = true;
      setTimeout(() => {
        popupLock = false;
        removePopup(); // 5秒后移除
      }, 5000);
    }

    // 鼠标移出 popup 时隐藏（若未锁定）
    popup.addEventListener('mouseleave', () => {
      if (!popupLock) removePopup();
    });
  }

  function removePopup() {
    const existing = document.querySelector('.ahm-popup');
    if (existing) existing.remove();
  }

  fetchData(currentYear);
});