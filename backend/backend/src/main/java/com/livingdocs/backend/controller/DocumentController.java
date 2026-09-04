package com.livingdocs.backend.controller;

import com.livingdocs.backend.model.AuditTrail;
import com.livingdocs.backend.model.Document;
import com.livingdocs.backend.repository.AuditTrailRepository;
import com.livingdocs.backend.repository.DocumentRepository;
import com.livingdocs.backend.service.GithubPushService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/documents")
@CrossOrigin(origins = "*")
public class DocumentController {

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private AuditTrailRepository auditTrailRepository;

    @Autowired
    private GithubPushService githubPushService;

    // API 1: Lấy danh sách toàn bộ tài liệu
    @GetMapping
    public List<Document> getAllDocuments() {
        return documentRepository.findAll();
    }

    // API 2: Lấy chi tiết một tài liệu theo ID
    @GetMapping("/{id}")
    public ResponseEntity<Document> getDocumentById(@PathVariable String id) {
        Optional<Document> document = documentRepository.findById(id);
        return document.map(ResponseEntity::ok)
                       .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // API 3: Phê duyệt tài liệu (Staff) — đổi trạng thái + ghi audit log
    @PostMapping("/{id}/approve")
    public ResponseEntity<Document> approveDocument(@PathVariable String id,
                                                      @RequestBody(required = false) Map<String, String> body) {
        Optional<Document> docOpt = documentRepository.findById(id);
        if (docOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        String feedback = body != null ? body.getOrDefault("feedback", "") : "";

        Document doc = docOpt.get();
        doc.setStatus("APPROVED");
        documentRepository.save(doc);

        auditTrailRepository.save(buildLog(id, "APPROVED", "STAFF", "Bui Nguyen Yen Vy", feedback));

        return ResponseEntity.ok(doc);
    }

    // API 4: Từ chối tài liệu (Reject) — đổi trạng thái + ghi audit log
    @PostMapping("/{id}/reject")
    public ResponseEntity<Document> rejectDocument(@PathVariable String id,
                                                     @RequestBody(required = false) Map<String, String> body) {
        Optional<Document> docOpt = documentRepository.findById(id);
        if (docOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        String feedback = body != null ? body.getOrDefault("feedback", "") : "";

        Document doc = docOpt.get();
        doc.setStatus("REJECTED");
        documentRepository.save(doc);

        auditTrailRepository.save(buildLog(id, "REJECTED", "STAFF", "Bui Nguyen Yen Vy", feedback));

        return ResponseEntity.ok(doc);
    }

    // API 5: Xuất bản tài liệu (Manager Publish) — gọi GithubPushService mô phỏng
    @PostMapping("/{id}/publish")
    public ResponseEntity<Document> publishDocument(@PathVariable String id) {
        Optional<Document> docOpt = documentRepository.findById(id);
        if (docOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Document doc = docOpt.get();
        if (!"APPROVED".equals(doc.getStatus())) {
            return ResponseEntity.badRequest().build(); // Chưa Approve thì không cho Publish
        }

        String commitHash = githubPushService.simulatePush(doc.getName(), doc.getRepository());

        doc.setStatus("PUBLISHED");
        doc.setCommitHash(commitHash);
        documentRepository.save(doc);

        auditTrailRepository.save(buildLog(id, "PUBLISHED", "MANAGER", "Bui Nguyen Yen Vy (as Manager)", ""));

        return ResponseEntity.ok(doc);
    }

    private AuditTrail buildLog(String docId, String action, String role, String actor, String feedback) {
        AuditTrail log = new AuditTrail();
        log.setDocumentId(docId);
        log.setAction(action);
        log.setActorRole(role);
        log.setActorName(actor);
        log.setTimestamp(LocalDateTime.now());
        log.setFeedback(feedback);
        return log;
    }
}