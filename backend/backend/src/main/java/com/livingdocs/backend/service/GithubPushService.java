package com.livingdocs.backend.service;

import org.springframework.stereotype.Service;
import java.util.UUID;

@Service
public class GithubPushService {

    public String simulatePush(String fileName, String repository) {
        String commitHash = UUID.randomUUID().toString().substring(0, 8);

        System.out.println("[GITHUB-SERVICE] - INFO - Bắt đầu quy trình tự động đồng bộ tài liệu lên GitHub...");
        System.out.println("[GITHUB-SERVICE] - INFO - Repository: " + repository);
        System.out.println("[GITHUB-SERVICE] - SUCCESS - Đã đẩy file '" + fileName + "' lên repository '" + repository + "' thành công.");
        System.out.println("[GITHUB-SERVICE] - Commit Hash sinh ra: " + commitHash);

        return commitHash;
    }
}