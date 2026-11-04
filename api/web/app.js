const API_URL = "http://127.0.0.1:8000/predict";
let currentMode = 'simple';

function switchTab(mode) {
  currentMode = mode;
  const buttons = document.querySelectorAll('.tab-btn');
  buttons[0].classList.toggle('active', mode === 'simple');
  buttons[1].classList.toggle('active', mode === 'detail');

  document.getElementById('detailSection').style.display = mode === 'detail' ? 'block' : 'none';
}

document.getElementById('predictForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  // 범위 검증 (7.7 ~ 157 평)
  const pyeongVal = Number(document.getElementById('area_pyeong').value);
  if (pyeongVal < 7.7 || pyeongVal > 157) {
    alert("평수는 7.7평 ~ 157평 사이만 입력할 수 있습니다.");
    return;
  }

  // 1. 공통 9개 입력값
  let payload = {
    mode: currentMode,
    area_pyeong: pyeongVal,
    stories: Number(document.getElementById('stories').value),
    state: document.getElementById('state').value,
    climate_zone: document.getElementById('climate_zone').value,
    building_type: document.getElementById('building_type').value,
    vintage: document.getElementById('vintage').value,
    cooling_type: document.getElementById('cooling_type').value,
    heating_type: document.getElementById('heating_type').value,
    heating_fuel: document.getElementById('heating_fuel').value
  };

  // 2. 상세 모드일 경우 나머지 18개 특성 포함 (총 27개)
  if (currentMode === 'detail') {
    payload = {
      ...payload,
      bedrooms: Number(document.getElementById('bedrooms').value),
      occupants: Number(document.getElementById('occupants').value),
      heating_setpoint_f: Number(document.getElementById('heating_setpoint_f').value),
      cooling_setpoint_f: Number(document.getElementById('cooling_setpoint_f').value),
      infiltration_ach50: Number(document.getElementById('infiltration_ach50').value),
      wall_r: Number(document.getElementById('wall_r').value),
      ceiling_r: Number(document.getElementById('ceiling_r').value),
      roof_r: Number(document.getElementById('roof_r').value),
      floor_r: Number(document.getElementById('floor_r').value),
      wall_type: document.getElementById('wall_type').value,
      windows: document.getElementById('windows').value,
      wall_area_ft2: Number(document.getElementById('wall_area_ft2').value),
      window_area_ft2: Number(document.getElementById('window_area_ft2').value),
      roof_area_ft2: Number(document.getElementById('roof_area_ft2').value),
      door_area_ft2: Number(document.getElementById('door_area_ft2').value),
      foundation: document.getElementById('foundation').value,
      attic: document.getElementById('attic').value,
      garage: document.getElementById('garage').value
    };
  }

  const resultBox = document.getElementById('result');
  const warningBox = document.getElementById('warningBox');
  warningBox.style.display = 'none';

  document.getElementById('heatingKwh').innerText = "계산 중...";
  document.getElementById('coolingKwh').innerText = "계산 중...";
  resultBox.style.display = 'block';

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `서버 오류 (${response.status})`);
    }

    // 결과 수치 표기 (kWh / MBtu)
    const heatKwh = data.heating_kwh_per_year ?? data.heating_kwh ?? 0;
    const coolKwh = data.cooling_kwh_per_year ?? data.cooling_kwh ?? 0;
    const heatMbtu = data.heating_mbtu_per_year ?? (heatKwh / 293.07).toFixed(1);
    const coolMbtu = data.cooling_mbtu_per_year ?? (coolKwh / 293.07).toFixed(1);

    document.getElementById('heatingKwh').innerText = Number(heatKwh).toLocaleString();
    document.getElementById('heatingMbtu').innerText = `(${heatMbtu} MBtu)`;

    document.getElementById('coolingKwh').innerText = Number(coolKwh).toLocaleString();
    document.getElementById('coolingMbtu').innerText = `(${coolMbtu} MBtu)`;

    // 경고 문구 처리
    if (data.warnings && data.warnings.length > 0) {
      warningBox.innerText = "⚠️ 경고: " + data.warnings.join(", ");
      warningBox.style.display = 'block';
    }

    document.getElementById('noteText').innerText = `적용 모델: ResStock ${currentMode.toUpperCase()} (단위: 연간 에너지 부하)`;

  } catch (error) {
    alert("예측 요청 실패: " + error.message);
    document.getElementById('heatingKwh').innerText = "에러";
    document.getElementById('coolingKwh').innerText = "에러";
  }
});