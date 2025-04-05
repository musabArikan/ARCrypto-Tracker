$(() => {
   let favorites;
   let favoritesGrid;
   let cryptosGrid;
   let marketData = [];

   const loadData = () => {
      fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd", {
         method: "GET",
         headers: { "content-type": "application/json" },
      })
         .then((res) => {
            if (res.ok) return res.json();
         })
         .then((tasks) => {
            marketData = tasks;
            favoritesGrid.getDataSource().reload();
            cryptosGrid.getDataSource().reload();
         });
   };

   const cryptoDataStore = new DevExpress.data.CustomStore({
      key: "id",
      load(loadOptions) {
         return marketData;
      },
   });

   const baseGridConfig = {
      columns: [
         {
            dataField: "isFavorite",
            caption: "",
            alignment: "center",
            cssClass: "p-0",
            allowFiltering: false,
            width: "3.5em",
            calculateCellValue: (_rowData) => {
               return favorites.indexOf(_rowData.id) > -1;
            },
            cellTemplate: (cellElement, options) => {
               return $("<div>").dxButton({
                  icon:
                     favorites.indexOf(options.data.id) > -1
                        ? "bi bi-star-fill text-warning"
                        : "bi bi-star",
                  onClick: () => {
                     const grid = options.component;
                     toggleCoinsToFavorites(
                        options.data.id,
                        grid.option("gridId")
                     );
                     grid.repaintRows(options.rowIndex);
                  },
               });
            },
         },

         {
            dataField: "market_cap_rank",
            caption: "#",
            sortIndex: 0,
            sortOrder: "asc",
            width: "5em",
         },
         {
            dataField: "name",
            caption: "Coin",
            cellTemplate: `<div class='d-flex gap-2'><a class='text-decoration-none text-body' href="https://musabarikan.com.tr/projects/arcrypto/detail/detail.html?coin={{data.id}}"><img src='{{data.image}}' style="height:1.5em"></img> {{value}} <span class='text-muted text-uppercase'>{{data.symbol}}</span></a></div>`,
         },
         {
            dataField: "current_price",
            caption: "Price",
            dataType: "number",
            format: "$ #,##0.###",
         },
         {
            dataField: "price_change_percentage_24h",
            caption: "Price Change % (24h)",
            dataType: "number",

            cellTemplate: (cellElement, options) => {
               const cellTemplate = $("<div>")
                  .text(
                     Intl.NumberFormat("tr-TR", { style: "percent" }).format(
                        options.value
                     )
                  )
                  .addClass(
                     options.value >= 0 ? "text-success" : "text-danger"
                  );
               $("<i class='me-1 d-inline-block'>")
                  .addClass(
                     options.value >= 0
                        ? "bi bi-caret-up-fill"
                        : "bi bi-caret-down-fill"
                  )
                  .prependTo(cellTemplate);
               return cellTemplate;
            },
         },
         {
            dataField: "price_change_24h",
            caption: "Price Change (24h)",
            dataType: "number",
            format: "$ #,##0.###",
            cellTemplate: (cellElement, options) => {
               const cellTemplate = $("<div>")
                  .text(options.text)
                  .addClass(
                     options.value >= 0 ? "text-success" : "text-danger"
                  );
               $("<i class='me-1 d-inline-block'>")
                  .addClass(
                     options.value >= 0
                        ? "bi bi-caret-up-fill"
                        : "bi bi-caret-down-fill"
                  )
                  .prependTo(cellTemplate);
               return cellTemplate;
            },
         },

         {
            dataField: "total_volume",
            caption: "24h Volume",
            dataType: "number",
            format: "$ #,##0.###",
         },
         {
            dataField: "sparkline",
            caption: "Last 7 Days",
            allowFiltering: false,
            cellTemplate: (_cellElement, _options) => {
               const img = $(`<img></img>`);
               img.attr(
                  "src",
                  `https://www.coingecko.com/coins/${
                     _options.data.image.split("/")[5]
                  }/sparkline.svg`
               );
               return img;
            },
         },
      ],
      height: "auto",
      width: "100%",
      showBorders: false,
      columnAutoWidth: true,
      allowColumnReordering: true,
      allowColumnResizing: true,
      repaintChangesOnly: true,
      hoverStateEnabled: true,
      sorting: {
         mode: "multiple",
      },
      stateStoring: {
         enabled: true,
         type: "localStorage",
      },
   };

   const loadFavoritesFromStorege = () => {
      let localData = localStorage.getItem("favoreiteCoins");
      if (localData) favorites = JSON.parse(localData);
      else {
         favorites = ["bitcoin", "ethereum"];
         saveFavoritesToStore();
      }
   };

   const saveFavoritesToStore = () => {
      localStorage.setItem("favoreiteCoins", JSON.stringify(favorites));
   };

   const addCoinToFavorites = (_coinId) => {
      favorites.push(_coinId);
      saveFavoritesToStore();
      DevExpress.ui.notify(`${_coinId} added to favorites list`, "success");
   };

   const removeCoinToFavorites = (_coinId) => {
      const index = favorites.indexOf(_coinId);
      if (index > -1) {
         favorites.splice(index, 1);
         saveFavoritesToStore();
         favoritesGrid.getDataSource().reload();
         DevExpress.ui.notify(`${_coinId} removed from favorites list`);
      }
   };

   const toggleCoinsToFavorites = (_coinId, _eventSource) => {
      const index = favorites.indexOf(_coinId);
      if (index > -1) {
         removeCoinToFavorites(_coinId);
      } else {
         addCoinToFavorites(_coinId);
      }

      if (_eventSource == "cryptosGrid") favoritesGrid.getDataSource().reload();
      else if (_eventSource == "favoriteCryptosGrid")
         cryptosGrid.getDataSource().reload();
   };

   loadFavoritesFromStorege();

   const initPage = () => {
      DevExpress.setTemplateEngine({
         compile: (_element) => {
            return Handlebars.compile(
               typeof _element == "string"
                  ? _element
                  : _element.get(0).outerHTML,
               {}
            );
         },
         render: (template, data) => template(data),
      });
   };

   const initCoinsTable = () => {
      const gridId = "cryptosGrid";
      const gridConfig = jQuery.extend(true, {}, baseGridConfig, {
         gridId: gridId,
         dataSource: new DevExpress.data.DataSource({
            store: cryptoDataStore,
         }),
         pager: {
            visible: true,
            allowedPageSizes: [5, 10, 30, 50, 100, "all"],
            showPageSizeSelector: true,
            displayMode: "compact",
            showInfo: true,
            showNavigationButtons: true,
         },
         paging: {
            pageSize: 30,
         },
         filterPanel: {
            visible: true,
         },
         searchPanel: {
            visible: true,
            width: 240,
            placeholder: "Search...",
         },
         stateStoring: {
            storageKey: "cryptosGridState",
         },
      });
      cryptosGrid = $(`#${gridId}`)
         .dxDataGrid(gridConfig)
         .dxDataGrid("instance");
   };

   const initFavoriteCoinsTable = () => {
      const gridId = "favoriteCryptosGrid";
      const gridConfig = jQuery.extend(true, {}, baseGridConfig, {
         gridId: gridId,
         dataSource: new DevExpress.data.DataSource({
            filter: (_data) => {
               return favorites.indexOf(_data.id) > -1;
            },
            store: cryptoDataStore,
         }),

         stateStoring: {
            storageKey: "favoriteCryptosGridState",
         },
      });
      favoritesGrid = $(`#${gridId}`)
         .dxDataGrid(gridConfig)
         .dxDataGrid("instance");
   };

   initPage();
   initFavoriteCoinsTable();
   initCoinsTable();
   loadData();
});
