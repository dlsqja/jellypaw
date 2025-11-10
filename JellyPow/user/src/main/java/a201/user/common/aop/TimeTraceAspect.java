package a201.user.common.aop;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class TimeTraceAspect {

    @Around("@annotation(a201.user.common.annotation.TimeTrace)")
    public Object trace(ProceedingJoinPoint joinPoint) throws Throwable {
        // 메서드 정보 가져오기
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        String className = signature.getDeclaringType().getSimpleName();
        String methodName = signature.getName();
        
        // 시작 시간
        long startTime = System.currentTimeMillis();
        
        System.out.println("--- [시작] " + className + "." + methodName + "() ---");
        
        Object result = null;
        try {
            // 실제 메서드 실행
            result = joinPoint.proceed();
            
            // 종료 시간
            long endTime = System.currentTimeMillis();
            long duration = endTime - startTime;
            
            System.out.println("--- [종료] " + className + "." + methodName + "() ---");
            System.out.println("소요 시간: " + duration + "ms");
            
            // 결과가 List인 경우 개수도 출력
            if (result instanceof java.util.List) {
                System.out.println("검색 결과: " + ((java.util.List<?>) result).size() + "건");
            }
            
        } catch (Exception e) {
            long endTime = System.currentTimeMillis();
            long duration = endTime - startTime;
            
            System.err.println("=== [에러] " + className + "." + methodName + "() ===");
            System.err.println("소요 시간: " + duration + "ms");
            System.err.println("에러: " + e.getMessage());
            
            throw e;
        }
        
        return result;
    }
}

