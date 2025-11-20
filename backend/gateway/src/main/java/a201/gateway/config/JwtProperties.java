package a201.gateway.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@ConfigurationProperties(prefix = "jwt")
public class JwtProperties {
    
    private String secret;
    private long expiration;
    private Public publicPaths = new Public();
    
    public String getSecret() {
        return secret;
    }
    
    public void setSecret(String secret) {
        this.secret = secret;
    }
    
    public long getExpiration() {
        return expiration;
    }
    
    public void setExpiration(long expiration) {
        this.expiration = expiration;
    }
    
    public Public getPublic() {
        return publicPaths;
    }
    
    public void setPublic(Public publicPaths) {
        this.publicPaths = publicPaths;
    }
    
    public static class Public {
        private List<String> paths;
        
        public List<String> getPaths() {
            return paths;
        }
        
        public void setPaths(List<String> paths) {
            this.paths = paths;
        }
    }
}

