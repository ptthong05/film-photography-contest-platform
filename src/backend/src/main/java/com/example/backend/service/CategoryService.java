package com.example.backend.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.backend.dto.CategoryRequest;
import com.example.backend.dto.CategoryResponse;
import com.example.backend.entity.Category;
import com.example.backend.exception.DuplicateResourceException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.repository.CategoryRepository;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public CategoryResponse getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thể loại với id: " + id));
        return toResponse(category);
    }

    public CategoryResponse createCategory(CategoryRequest request) {
        String cleanName = request.getName().trim();
        if (categoryRepository.existsByNameIgnoreCase(cleanName)) {
            throw new DuplicateResourceException("Tên thể loại đã tồn tại: " + cleanName);
        }

        Category category = new Category();
        category.setName(cleanName);
        category.setDescription(request.getDescription());

        Category saved = categoryRepository.save(category);
        return toResponse(saved);
    }

    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thể loại với id: " + id));

        String cleanName = request.getName().trim();
        if (!category.getName().equalsIgnoreCase(cleanName)
                && categoryRepository.existsByNameIgnoreCase(cleanName)) {
            throw new DuplicateResourceException("Tên thể loại đã tồn tại: " + cleanName);
        }

        category.setName(cleanName);
        category.setDescription(request.getDescription());

        Category updated = categoryRepository.save(category);
        return toResponse(updated);
    }

    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thể loại với id: " + id));
        categoryRepository.delete(category);
    }

    private CategoryResponse toResponse(Category category) {
        CategoryResponse response = new CategoryResponse();
        response.setId(category.getId());
        response.setName(category.getName());
        response.setDescription(category.getDescription());
        response.setCreatedAt(category.getCreatedAt());
        return response;
    }
}