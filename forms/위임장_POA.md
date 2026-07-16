# 위임장 / Power of Attorney (출입국민원 대행용)

> **주의**: 본 서식은 하이코리아(hikorea.go.kr) 민원서식의 출입국민원 대행 위임장
> 구조(위임인–수임인–위임업무–서명)를 따라 작성한 서비스용 전자 서식 초안입니다.
> 하이코리아 서식자료실의 **최신 공식 서식(통합신청서 내 위임장 포함)** 을 내려받아
> 항목·문구를 대조 확정한 뒤 사용해야 합니다. 이 파일은 개발용 필드 정의를 겸합니다.

---

## 위 임 장 (POWER OF ATTORNEY)

### 1. 위임인 (민원인) / Applicant (Principal)

| 항목 / Item | 기재 / Entry |
|---|---|
| 성명 (여권 표기) / Full name as in passport | `applicant_name` |
| 생년월일 / Date of birth | `birth_date` |
| 성별 / Sex | `sex` |
| 국적 / Nationality | `nationality` |
| 여권번호 / Passport No. | `passport_no` |
| 외국인등록번호 / Alien registration No. (해당 시 / if any) | `arc_no` |
| 현재 체류자격 / Current status of stay | `current_visa` |
| 대한민국 내 주소 / Address in Korea | `address_kr` |
| 연락처 (전화·이메일) / Phone & Email | `phone`, `email` |

### 2. 수임인 (출입국민원 대행기관) / Agent (Registered Civil Affairs Agency)

| 항목 / Item | 기재 / Entry |
|---|---|
| 사무소 명칭 / Office name | (사무소명) |
| 대행기관 등록번호 / Agency registration No. | (출입국·외국인청 등록번호) |
| 성명·자격 / Name & qualification | (성명) 변호사·행정사 / Attorney at Law & Administrative Agent |
| 사무소 소재지 / Office address | (주소) |
| 연락처 / Contact | (전화, 이메일) |

### 3. 위임 업무 / Delegated Matters

아래 표시한 출입국민원의 **신청서 작성, 서류 제출, 접수, 보완서류 제출, 결과(허가증·등록증 등) 수령**에 관한 일체의 권한을 수임인에게 위임합니다.
I hereby authorize the Agent to prepare, file, and submit the application(s) checked below, to submit supplementary documents, and to receive the results (permits, registration card, etc.) on my behalf.

- [ ] 체류기간 연장허가 / Extension of sojourn period
- [ ] 체류자격 변경허가 / Change of status of sojourn
- [ ] 체류자격 부여 / Granting status of sojourn
- [ ] 사증발급인정서 / Confirmation of visa issuance
- [ ] 외국인등록 및 등록증 발급·재발급 / Alien registration & card (re)issuance
- [ ] 체류자격외 활동허가 / Engaging in activities not covered by the status
- [ ] 근무처 변경·추가 허가(신고) / Change or addition of workplace
- [ ] 재입국허가 / Re-entry permit
- [ ] 체류지 변경 신고 / Report on alteration of residence
- [ ] 기타 / Other: ______________________

### 4. 유의사항 / Notes

1. 위임인은 제출 서류와 답변 내용이 사실임을 확인하며, 허위 기재 시 불이익(불허·처벌)을 받을 수 있음을 이해합니다. / The Principal confirms that all documents and statements are true; false statements may result in denial or penalties.
2. 본 위임은 해당 민원의 처리 종결 시까지 유효하며, 위임인은 언제든지 서면(전자적 방법 포함)으로 철회할 수 있습니다. / This POA remains valid until the matter is concluded and may be revoked in writing (including electronically) at any time.
3. 수임인은 대행 과정의 고의·과실로 인한 손해에 대해 관계 법령에 따라 책임을 집니다. / The Agent is liable under applicable laws for damages caused intentionally or negligently.

### 5. 서명 / Signature

```
작성일 / Date: ________년(Y) ____월(M) ____일(D)

위임인 / Principal:  성명 ______________  서명 ______________
수임인 / Agent:      성명 ______________  서명 ______________
```

> 전자서명 처리: 서비스 내 서명은 전자서명 캡처 + 타임스탬프 + IP를
> `consents` 테이블(doc='위임장', version, signed_at, ip)에 저장하고 PDF로 고정 보관.
> 출입국 제출용은 출력·자필 서명본이 요구될 수 있으므로 접수 유형별 요건 확인. `[확인]`
