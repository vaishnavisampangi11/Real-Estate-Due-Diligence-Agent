package com.realestate.agent.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.client.ClientHttpResponse;
import org.springframework.http.converter.FormHttpMessageConverter;
import org.springframework.security.oauth2.client.endpoint.DefaultAuthorizationCodeTokenResponseClient;
import org.springframework.security.oauth2.client.endpoint.OAuth2AccessTokenResponseClient;
import org.springframework.security.oauth2.client.endpoint.OAuth2AuthorizationCodeGrantRequest;
import org.springframework.security.oauth2.client.http.OAuth2ErrorResponseErrorHandler;
import org.springframework.security.oauth2.core.endpoint.OAuth2AccessTokenResponse;
import org.springframework.security.oauth2.core.http.converter.OAuth2AccessTokenResponseHttpMessageConverter;
import org.springframework.util.StreamUtils;
import org.springframework.web.client.RestTemplate;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;

public class OAuth2DiagnosticTokenResponseClient implements OAuth2AccessTokenResponseClient<OAuth2AuthorizationCodeGrantRequest> {

    private static final Logger log = LoggerFactory.getLogger(OAuth2DiagnosticTokenResponseClient.class);
    private final DefaultAuthorizationCodeTokenResponseClient delegate;

    public OAuth2DiagnosticTokenResponseClient() {
        this.delegate = new DefaultAuthorizationCodeTokenResponseClient();

        RestTemplate restTemplate = new RestTemplate(List.of(
                new FormHttpMessageConverter(),
                new OAuth2AccessTokenResponseHttpMessageConverter()
        ));
        restTemplate.setErrorHandler(new OAuth2ErrorResponseErrorHandler());

        restTemplate.getInterceptors().add((request, body, execution) -> {
            log.info("OAuth2 Token Exchange -> Sending POST request to: {}", request.getURI());
            log.info("OAuth2 Token Exchange -> Headers sent: {}", request.getHeaders().keySet());

            ClientHttpResponse response = execution.execute(request, body);

            HttpStatusCode statusCode = response.getStatusCode();
            byte[] bodyBytes = StreamUtils.copyToByteArray(response.getBody());
            String responseString = new String(bodyBytes, StandardCharsets.UTF_8);

            if (!statusCode.is2xxSuccessful()) {
                log.warn("OAuth2 Token Exchange Provider Error -> HTTP Status: {}, Response Body: {}", statusCode, responseString);
            } else {
                log.info("OAuth2 Token Exchange -> Successful token response received from Provider (Status: {})", statusCode);
            }

            return new BufferingClientHttpResponse(response, bodyBytes);
        });

        this.delegate.setRestOperations(restTemplate);
    }

    @Override
    public OAuth2AccessTokenResponse getTokenResponse(OAuth2AuthorizationCodeGrantRequest authorizationGrantRequest) {
        return this.delegate.getTokenResponse(authorizationGrantRequest);
    }

    private static class BufferingClientHttpResponse implements ClientHttpResponse {
        private final ClientHttpResponse response;
        private final byte[] body;

        public BufferingClientHttpResponse(ClientHttpResponse response, byte[] body) {
            this.response = response;
            this.body = body != null ? body : new byte[0];
        }

        @Override
        public HttpStatusCode getStatusCode() throws IOException {
            return this.response.getStatusCode();
        }

        @Override
        public String getStatusText() throws IOException {
            return this.response.getStatusText();
        }

        @Override
        public void close() {
            this.response.close();
        }

        @Override
        public InputStream getBody() {
            return new ByteArrayInputStream(this.body);
        }

        @Override
        public HttpHeaders getHeaders() {
            return this.response.getHeaders();
        }
    }
}