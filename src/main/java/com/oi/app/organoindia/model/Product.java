package com.oi.app.organoindia.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.sql.Timestamp;

@Getter
@Setter
@Entity(name = "PRODUCT")
public class Product {

    @Id
    private Long id;

    @Column(name = "NAME")
    private String name;

    @Column(name = "RATE")
    private BigDecimal rate;

    @Column(name = "LAST_UPDATED_TIME")
    private Timestamp lastUpdatedTime;
}
