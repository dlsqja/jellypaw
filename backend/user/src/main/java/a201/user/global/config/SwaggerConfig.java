package a201.user.global.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI userServiceOpenAPI() {
        Server server = new Server();
        server.setUrl("http://localhost:8888");
        server.setDescription("Gateway Server");

        Contact contact = new Contact();
        contact.setName("JellyPaw API Support");
        contact.setEmail("support@jellypaw.com");

        Info info = new Info()
                .title("User Service API")
                .version("1.0.0")
                .description("JellyPaw User Service API 문서입니다.")
                .contact(contact);

        return new OpenAPI()
                .info(info)
                .servers(List.of(server));
    }
}

