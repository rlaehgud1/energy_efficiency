import json
import Lambda_function

# 1. 8개 상세 변수를 넣는 방식 테스트
test_event_1 = {
    "body": json.dumps({
        "relative_compactness": 0.82,
        "surface_area": 673.75,
        "wall_area": 318.5,
        "roof_area": 122.5,
        "height": 7.0,
        "orientation": 3,
        "glazing_area": 0.25,
        "glazing_dist": 1
    })
}

# 2. 간단 평수(pyeong) 모드 테스트
test_event_2 = {
    "body": json.dumps({
        "pyeong": 30
    })
}

print("=== [1] 상세 변수 예측 결과 ===")
print(Lambda_function.lambda_handler(test_event_1, None))

print("\n=== [2] 평수 기반 예측 결과 ===")
print(Lambda_function.lambda_handler(test_event_2, None))
