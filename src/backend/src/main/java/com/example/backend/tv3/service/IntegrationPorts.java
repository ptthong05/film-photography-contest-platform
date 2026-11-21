package com.example.backend.tv3.service;

import com.example.backend.tv3.integration.ContestAccess;
import com.example.backend.tv3.web.Tv3Exception;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@Component
@Profile("tv3")
public class IntegrationPorts {
    private final ObjectProvider<ContestAccess> access;

    public IntegrationPorts(ObjectProvider<ContestAccess> access) {
        this.access = access;
    }

    public ContestAccess contests() {
        ContestAccess port = access.getIfAvailable();
        if (port == null)
            throw new Tv3Exception(503, "Chưa tích hợp adapter Contest/Registration của TV2");
        return port;
    }
}
