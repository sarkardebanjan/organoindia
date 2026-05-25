package com.oi.app.organoindia.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ProductService {

    //@PreAuthorize("hasRole('ADMIN')")
    //public Product createProduct(ProductRequest req) {}

    //@PreAuthorize("hasRole('ADMIN')")
    //public Product updateProduct(Long id, ProductRequest req) {}

    @PreAuthorize("hasRole('ADMIN')")
    public void deleteProduct(Long id) {}

    // No annotation — accessible to everyone including unauthenticated
    //public List<Product> getAllProducts() {}

    // Must be logged in but either role is fine
    //@PreAuthorize("isAuthenticated()")
    //public Order placeOrder(OrderRequest req) {}
}