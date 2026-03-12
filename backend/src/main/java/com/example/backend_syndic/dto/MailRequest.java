package com.example.backend_syndic.dto;

public class MailRequest {

    private String targetEmail;
    private String subject;
    private String body;

    public MailRequest() {
    }

    public MailRequest(String targetEmail, String subject, String body) {
        this.targetEmail = targetEmail;
        this.subject = subject;
        this.body = body;
    }

    public String getTargetEmail() {
        return targetEmail;
    }

    public void setTargetEmail(String targetEmail) {
        this.targetEmail = targetEmail;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getBody() {
        return body;
    }

    public void setBody(String body) {
        this.body = body;
    }
}
