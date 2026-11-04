# 학습 데이터 설명 — Energy Efficiency Dataset

## 출처
- UCI Machine Learning Repository - Energy Efficiency Dataset
- https://archive.ics.uci.edu/dataset/242/energy+efficiency
- 768개 샘플, 결측치 없음, CC BY 4.0 라이선스

## 데이터 개요
건물 설계 시뮬레이션(Ecotect) 기반 데이터로, 12가지 건물 형태에 유리창 면적·분포·방향 등을 다양하게 조합해 만든 768개 건물 케이스. 건물의 물리적 설계 조건만으로 냉난방에 필요한 에너지를 예측하는 것이 목표.

## Feature (입력 변수, 8개)

| 변수명 | 원본 컬럼 | 타입 | 설명 |
|---|---|---|---|
| relative_compactness | X1 | Continuous | 상대 조밀도 |
| surface_area | X2 | Continuous | 표면적 |
| wall_area | X3 | Continuous | 벽면적 |
| roof_area | X4 | Continuous | 지붕면적 |
| height | X5 | Continuous | 높이 |
| orientation | X6 | Integer (범주형) | 방향 (값 2~5) |
| glazing_area | X7 | Continuous | 유리창 면적 |
| glazing_dist | X8 | Integer (범주형) | 유리창 분포 (값 0~5) |

## Label (예측 대상, 2개)

| 변수명 | 원본 컬럼 | 타입 | 설명 |
|---|---|---|---|
| heating_load | Y1 | Continuous | 난방부하 |
| cooling_load | Y2 | Continuous | 냉방부하 |

## 전처리 정책
- 결측치 없어 결측치 처리 불필요
- orientation, glazing_dist는 범주형이지만, 트리 기반 모델(RandomForest) 사용 시 인코딩 없이 정수값 그대로 사용
- 학습 80% / 테스트 20%로 분할 (random_state=42 고정)
- 스케일링은 트리 기반 모델에서는 불필요 (생략)

## 모델 성능 (1차 RandomForest 기준)
| 타겟 | MAE | R² |
|---|---|---|
| heating_load | 0.348 | 0.9976 |
| cooling_load | 1.166 | 0.9608 |
