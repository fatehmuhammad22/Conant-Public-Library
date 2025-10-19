import React, { useEffect, useState } from "react";

export default function HomePagePreview() {
    const [tilesByColumn, setTilesByColumn] = useState({});

    useEffect(() => {
        const fetchTiles = async () => {
            try {
                const res = await fetch("https://localhost:7184/api/ContentItems/homepage");
                if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

                const data = await res.json();

                const columns = {};

                data.forEach((item) => {
                    if (item.columnNo) {
                        if (!columns[item.columnNo]) {
                            columns[item.columnNo] = [];
                        }
                        columns[item.columnNo].push(item);
                    }
                });

                Object.keys(columns).forEach(col => {
                    columns[col].sort((a, b) => a.orderno - b.orderno);
                });

                setTilesByColumn(columns);
            } catch (err) {
                console.error("Error loading homepage tiles:", err);
            }
        };

        fetchTiles();
    }, []);

    const groupedBySuffix = {};
    Object.keys(tilesByColumn).forEach(col => {
        const suffix = col.slice(-1);
        if (!groupedBySuffix[suffix]) groupedBySuffix[suffix] = [];
        groupedBySuffix[suffix].push(col);
    });

    Object.keys(groupedBySuffix).forEach(suffix => {
        groupedBySuffix[suffix].sort((a, b) => {
            const numA = parseInt(a.slice(0, -1), 10);
            const numB = parseInt(b.slice(0, -1), 10);
            return numA - numB;
        });
    });

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem", padding: "1rem" }}>
            {Object.entries(groupedBySuffix).map(([suffix, columns]) => (
                <div
                    key={suffix}
                    style={{ display: "flex", gap: "1rem" }}
                >
                    {columns.map(columnNo => {
                        const tiles = tilesByColumn[columnNo] || [];
                        return (
                            <div
                                key={columnNo}
                                style={{ flex: 1, border: "1px solid #ccc", padding: "1rem" }}
                            >
                                <h4>Column {columnNo}</h4>
                                {tiles.length === 0 ? (
                                    <p><em>No items to display.</em></p>
                                ) : (
                                    tiles.map(tile => (
                                        <div key={tile.id} style={{ marginBottom: "1.5rem" }}>
                                            {tile.title && <h5>{tile.title}</h5>}
                                            {tile.body && (
                                                <div dangerouslySetInnerHTML={{ __html: tile.body }} />
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        );
                    })}
                </div>
            ))}
        </div>
    );
}
