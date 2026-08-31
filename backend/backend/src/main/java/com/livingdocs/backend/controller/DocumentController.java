package com.livingdocs.backend.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.livingdocs.backend.model.Document;
import com.livingdocs.backend.repository.DocumentRepository;

@RestController
@RequestMapping("/api/documents")
@CrossOrigin(origins = "*") // Cho phép tất cả các nguồn kết nối để tránh lỗi CORS khi Vy chạy thử
public class DocumentController {

    @Autowired
    private DocumentRepository documentRepository;

    // API 1: Lấy danh sách toàn bộ tài liệu đang chờ duyệt để hiển thị lên Dashboard của Vy
    @GetMapping
    public List<Document> getAllDocuments() {
        return documentRepository.findAll();
    }

    // API 2: Lấy chi tiết một tài liệu theo ID phục vụ màn hình Workspace đối chiếu song song
    @GetMapping("/{id}")
    public ResponseEntity<Document> getDocumentById(@PathVariable String id) {
        Optional<Document> document = documentRepository.findById(id);
        return document.map(ResponseEntity::ok)
                       .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // API 3: Thực hiện duyệt phê duyệt tài liệu (Xóa khỏi hàng đợi sau khi duyệt thành công)
    @DeleteMapping("/{id}/approve")
    public ResponseEntity<Void> approveDocument(@PathVariable String id) {
        if (!documentRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        documentRepository.deleteById(id);
        // Ở các Sprint sau, chúng ta sẽ bổ sung code tự động cập nhật Audit Trail và đẩy file lên GitHub tại đây.
        return ResponseEntity.ok().build();
    }
}