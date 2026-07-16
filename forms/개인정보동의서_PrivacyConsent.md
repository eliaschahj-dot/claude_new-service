# 개인정보 수집·이용·제공 동의서 / Consent to Collection, Use and Provision of Personal Information

> **주의**: 하이코리아 민원서식 및 출입국민원 대행 실무의 동의서 구조를 따라 작성한
> 서비스용 전자 서식 초안입니다. 하이코리아 최신 공식 서식과 대조하고, 개인정보보호법
> 요건(제15조, 제17조, 제23조, 제24조)에 대한 대표(변호사) 최종 검토 후 확정할 것.
> 필드명은 개발용 데이터 정의를 겸합니다.

---

## 1. 수집·이용 항목 / Items Collected

**필수 항목 / Required**
- 인적사항: 성명, 생년월일, 성별, 국적, 여권번호, 외국인등록번호, 사진
- 연락처: 전화번호, 이메일, 대한민국 내 주소
- 체류정보: 체류자격, 체류기간, 출입국 이력, 학력·경력·소득 등 신청 요건 관련 정보
- 제출 서류에 포함된 정보 (여권 사본, 증명서 등) / Information contained in submitted documents
- 서비스 이용 기록: 상담(챗봇) 대화 내용, 접속 기록

**고유식별정보 / Unique identifiers** — 별도 동의
- 여권번호, 외국인등록번호 / Passport number, alien registration number

**민감정보 / Sensitive information** — 별도 동의 (해당자만)
- 범죄경력·출입국사범 처분 이력 등 신청 심사에 필요한 정보 / Criminal or immigration-violation records required for review

## 2. 수집·이용 목적 / Purpose

1. 출입국민원(사증·체류허가 등) 신청 대행 및 상담 / Filing and consultation of immigration applications
2. 서류 검토, 진행 상태 안내, 결과 통지 / Document review, status updates, result notification
3. 보수 청구·결제 처리 / Billing and payment
4. 체류기간 만료 등 법정기한 안내 / Expiry and legal deadline reminders
5. 법령상 의무 이행 (대행업무 처리 기록 보존 등) / Compliance with legal obligations

## 3. 보유·이용 기간 / Retention Period

- 위임 사무 종결일부터 **3년** (출입국민원 대행기관 관리지침상 처리 기록 보존기간과 정합) 후 지체 없이 파기
- Retained for **3 years** after conclusion of the delegated matter, then destroyed without delay
- 관계 법령(전자상거래법 등)이 더 긴 보존을 요구하는 결제·계약 기록은 해당 기간 적용

## 4. 제3자 제공 / Provision to Third Parties

| 제공받는 자 / Recipient | 목적 / Purpose | 항목 / Items | 보유기간 / Period |
|---|---|---|---|
| 법무부 출입국·외국인청(사무소·출장소) / Korea Immigration Service | 민원 신청·심사 / Application & review | 신청서 기재사항 및 제출 서류 일체 | 해당 기관 규정에 따름 |

## 5. 처리 위탁 / Outsourcing

| 수탁자 / Processor | 위탁 업무 / Task |
|---|---|
| 클라우드 서비스 제공자 (확정 시 기재) | 데이터 보관·시스템 운영 |
| 결제대행사(PG) (확정 시 기재) | 결제 처리 |
| AI 모델 제공자 (확정 시 기재) | 상담 챗봇 응답 생성 (학습 미사용 계약 조건) |

## 6. 동의 거부권 및 불이익 / Right to Refuse

귀하는 동의를 거부할 권리가 있습니다. 다만 필수 항목 동의를 거부할 경우 민원 대행
서비스 제공이 불가능합니다. 선택 항목(마케팅 알림 등) 거부 시에도 서비스 이용에는
제한이 없습니다. / You may refuse consent; however, refusal of required items makes
the service unavailable. Refusal of optional items does not affect the service.

## 7. 동의 / Consent

| 구분 | 동의 여부 |
|---|---|
| 필수 개인정보 수집·이용 / Required collection & use | ☐ 동의함 Agree ☐ 동의하지 않음 Disagree |
| 고유식별정보 처리 / Unique identifiers | ☐ 동의함 Agree ☐ 동의하지 않음 Disagree |
| 민감정보 처리 (해당 시) / Sensitive info (if any) | ☐ 동의함 Agree ☐ 동의하지 않음 Disagree |
| 제3자 제공 (출입국·외국인청) / Provision to KIS | ☐ 동의함 Agree ☐ 동의하지 않음 Disagree |
| (선택) 만료 알림·소식 수신 / (Optional) reminders & news | ☐ 동의함 Agree ☐ 동의하지 않음 Disagree |

```
작성일 / Date: ________년(Y) ____월(M) ____일(D)
성명 / Name: ______________   서명 / Signature: ______________
```

> 전자 처리: 각 동의 항목은 개별 체크로 수집하고 `consents` 테이블에
> 항목별(doc, version, signed_at, ip) 저장. 버전 개정 시 재동의 플로우 필수.
