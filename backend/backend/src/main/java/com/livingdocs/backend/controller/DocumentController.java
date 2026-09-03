package com.livingdocs.backend.controller;

import com.livingdocs.backend.model.Document;
import com.livingdocs.backend.repository.DocumentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/documents")
@CrossOrigin(origins = "*")
public class DocumentController {

    @Autowired
    private DocumentRepository documentRepository;

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

    // API 3: Phê duyệt tài liệu
    @DeleteMapping("/{id}/approve")
    public ResponseEntity<Void> approveDocument(@PathVariable String id) {
        if (!documentRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        documentRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    // API 4: Từ chối tài liệu (Reject)
    @PostMapping("/{id}/reject")
    public ResponseEntity<Void> rejectDocument(@PathVariable String id) {
        if (!documentRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        documentRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    // API 5: Xuất bản tài liệu (Publish)
    @PostMapping("/{id}/publish")
    public ResponseEntity<Void> publishDocument(@PathVariable String id) {
        if (!documentRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok().build();
    }
}