package a201.board;

import a201.common.config.CommonModuleConfig;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Import;

import java.util.TimeZone;

@SpringBootApplication
@Import(CommonModuleConfig.class)
public class BoardApplication {

    public static void main(String[] args) {
        SpringApplication.run(BoardApplication.class, args);
        TimeZone.setDefault(TimeZone.getTimeZone("Asia/Seoul"));
    }

}
