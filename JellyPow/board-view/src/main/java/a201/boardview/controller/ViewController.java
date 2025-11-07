package a201.boardview.controller;

import a201.common.enums.Category;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/boards")
@RequiredArgsConstructor
public class ViewController {

    @GetMapping
    public ResponseEntity<?> getBoardsPage() {
        return null;
    }

    @GetMapping("/{category}")
    public ResponseEntity<?> getBoardsPageByCategory(@PathVariable Category category) {
        return null;
    }

}
