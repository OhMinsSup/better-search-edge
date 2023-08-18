import { HTTPException } from "hono/http-exception";
import { ErrorMetadata } from "./types";

const errors: Record<string, ErrorMetadata> = {
  "-1": {
    code: "-1",
    statusCode: 400,
    message: "서버 내부에서 처리 중에 에러가 발생한 경우",
    resolution: "재시도",
  },
  "-2": {
    code: "-2",
    statusCode: 400,
    message:
      "필수 인자가 포함되지 않은 경우나 호출 인자값의 데이타 타입이 적절하지 않거나 허용된 범위를 벗어난 경우",
    resolution: "요청 파라미터 확인",
  },
  "-3": {
    code: "-3",
    statusCode: 403,
    message:
      "해당 API를 사용하기 위해 필요한 기능(간편가입, 동의항목, 서비스 설정 등)이 활성화 되지 않은 경우",
    resolution:
      "[내 애플리케이션]에서 필요한 기능을 선택한 후, [활성화 설정]에서 ON으로 설정한 후 재호출",
  },
  "-4": {
    code: "-4",
    statusCode: 403,
    message: "계정이 제재된 경우나 해당 계정에 제재된 행동을 하는 경우",
    resolution: "",
  },
  "-5": {
    code: "-5",
    statusCode: 403,
    message: "해당 API에 대한 요청 권한이 없는 경우",
    resolution:
      "해당 API의 이해하기 문서를 참고하여 검수 진행, 권한 획득 후 재호출",
  },
  "-7": {
    code: "-7",
    statusCode: 400,
    message: "서비스 점검 또는 내부 문제가 있는 경우",
    resolution: "해당 서비스 공지사항 확인",
  },
  "-8": {
    code: "-8",
    statusCode: 400,
    message: "올바르지 않은 헤더로 요청한 경우",
    resolution: "요청 헤더 확인",
  },
  "-9": {
    code: "-9",
    statusCode: 400,
    message: "서비스가 종료된 API를 호출한 경우",
    resolution: "공지 메일이나 데브톡 공지확인",
  },
  "-10": {
    code: "-10",
    statusCode: 400,
    message: "허용된 요청 회수를 초과한 경우",
    resolution:
      "쿼터 확인 후 쿼터 범위 내로 호출 조정, 필요시 데브톡으로 제휴 문의",
  },
  "-401": {
    code: "-401",
    statusCode: 401,
    message:
      "유효하지 않은 앱키나 액세스 토큰으로 요청한 경우, 등록된 앱 정보와 호출된 앱 정보가 불일치 하는 경우",
    resolution: "앱키 확인 또는 토큰 갱신, 개발자 사이트에 등록된 앱 정보 확인",
  },
  "-501": {
    code: "-501",
    statusCode: 400,
    message:
      "카카오톡 미가입 또는 유예 사용자가 카카오톡 또는 톡캘린더 API를 호출한 경우",
    resolution: "",
  },
  "-602": {
    code: "-602",
    statusCode: 400,
    message: "이미지 업로드 시 최대 용량을 초과한 경우",
    resolution: "",
  },
  "-603": {
    code: "-603",
    statusCode: 400,
    message: "카카오 플랫폼 내부에서 요청 처리 중 타임아웃이 발생한 경우",
    resolution: "",
  },
  "-606": {
    code: "-606",
    statusCode: 400,
    message: "업로드할 수 있는 최대 이미지 개수를 초과한 경우",
    resolution: "",
  },
  "-903": {
    code: "-903",
    statusCode: 400,
    message:
      "등록되지 않은 개발자의 앱키나 등록되지 않은 개발자의 앱키로 구성된 액세스 토큰으로 요청한 경우",
    resolution: "",
  },
  "-911": {
    code: "-911",
    statusCode: 400,
    message: "지원하지 않는 포맷의 이미지를 업로드 하는 경우",
    resolution: "",
  },
  "-9798": {
    code: "-9798",
    statusCode: 503,
    message: "서비스 점검중	",
    resolution: "",
  },
  "-10000": {
    code: "-10000",
    statusCode: 401,
    message: "인증되지 않은 앱키로 요청한 경우",
    resolution: "앱키 확인",
  },
  "-10001": {
    code: "-10001",
    statusCode: 400,
    message: "입력 파라미터 오류",
    resolution: "요청 파라미터 확인",
  },
};

type HTTPExceptionOptions = {
  res?: Response;
  message?: string;
};

export const KakaoKeyError = (options?: Omit<HTTPExceptionOptions, "res">) => {
  const res = new Response(JSON.stringify(errors["-10000"]), {
    status: errors["-10000"].statusCode,
  });
  return new HTTPException(res.status, { ...options, res });
};

export const InvalidArgumentsError = (
  options?: Omit<HTTPExceptionOptions, "res">
) => {
  const res = new Response(JSON.stringify(errors["-10001"]), {
    status: errors["-10001"].statusCode,
  });
  return new HTTPException(res.status, { ...options, res });
};
