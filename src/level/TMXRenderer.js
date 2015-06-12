/*
 * MelonJS Game Engine
 * Copyright (C) 2011 - 2015, Olivier Biot, Jason Oster, Aaron McLeod
 * http://www.melonjs.org
 *
 * Tile QT 0.7.x format
 * http://www.mapeditor.org/
 *
 */
(function () {

    /**
     * an Orthogonal Map Renderder
     * Tiled QT 0.7.x format
     * @memberOf me
     * @ignore
     * @constructor
     */
    me.TMXOrthogonalRenderer = Object.extend({
        // constructor
        init: function (cols, rows, tilewidth, tileheight) {
            this.cols = cols;
            this.rows = rows;
            this.tilewidth = tilewidth;
            this.tileheight = tileheight;
        },

        /**
         * return true if the renderer can render the specified layer
         * @ignore
         */
        canRender : function (layer) {
            return ((layer.orientation === "orthogonal") &&
                    (this.cols === layer.cols) &&
                    (this.rows === layer.rows) &&
                    (this.tilewidth === layer.tilewidth) &&
                    (this.tileheight === layer.tileheight));
        },

        /**
         * return the tile position corresponding to the specified pixel
         * @ignore
         */
        pixelToTileCoords : function (x, y) {
            return new me.Vector2d(this.pixelToTileX(x),
                                   this.pixelToTileY(y));
        },


        /**
         * return the tile position corresponding for the given X coordinate
         * @ignore
         */
        pixelToTileX : function (x) {
            return x / this.tilewidth;
        },


        /**
         * return the tile position corresponding for the given Y coordinates
         * @ignore
         */
        pixelToTileY : function (y) {
            return y / this.tileheight;
        },

        /**
         * return the pixel position corresponding of the specified tile
         * @ignore
         */
        tileToPixelCoords : function (x, y) {
            return new me.Vector2d(x * this.tilewidth,
                                   y * this.tileheight);
        },

        /**
         * fix the position of Objects to match
         * the way Tiled places them
         * @ignore
         */
        adjustPosition: function (obj) {
            // only adjust position if obj.gid is defined
            if (typeof(obj.gid) === "number") {
                 // Tiled objects origin point is "bottom-left" in Tiled,
                 // "top-left" in melonJS)
                obj.y -= obj.height;
            }
        },

        /**
         * draw the tile map
         * @ignore
         */
        drawTile : function (renderer, x, y, tmxTile, tileset) {
            // draw the tile
            tileset.drawTile(renderer,
                             tileset.tileoffset.x + x * this.tilewidth,
                             tileset.tileoffset.y + (y + 1) * this.tileheight - tileset.tileheight,
                             tmxTile);
        },

        /**
         * draw the tile map
         * @ignore
         */
        drawTileLayer : function (renderer, layer, rect) {
            // get top-left and bottom-right tile position
            var start = this.pixelToTileCoords(rect.pos.x,
                                               rect.pos.y).floorSelf();

            var end = this.pixelToTileCoords(rect.pos.x + rect.width + this.tilewidth,
                                             rect.pos.y + rect.height + this.tileheight).ceilSelf();

            //ensure we are in the valid tile range
            end.x = end.x > this.cols ? this.cols : end.x;
            end.y = end.y > this.rows ? this.rows : end.y;

            // main drawing loop
            for (var y = start.y; y < end.y; y++) {
                for (var x = start.x; x < end.x; x++) {
                    var tmxTile = layer.layerData[x][y];
                    if (tmxTile) {
                        this.drawTile(renderer, x, y, tmxTile, tmxTile.tileset);
                    }
                }
            }
        }
    });

    /**
     * an Isometric Map Renderder
     * Tiled QT 0.7.x format
     * @memberOf me
     * @ignore
     * @constructor
     */
    me.TMXIsometricRenderer = Object.extend({
        // constructor
        init: function (cols, rows, tilewidth, tileheight) {
            this.cols = cols;
            this.rows = rows;
            this.tilewidth = tilewidth;
            this.tileheight = tileheight;
            this.hTilewidth = tilewidth / 2;
            this.hTileheight = tileheight / 2;
            this.originX = this.rows * this.hTilewidth;
        },

        /**
         * return true if the renderer can render the specified layer
         * @ignore
         */
        canRender : function (layer) {
            return (
                (layer.orientation === "isometric") &&
                (this.cols === layer.cols) &&
                (this.rows === layer.rows) &&
                (this.tilewidth === layer.tilewidth) &&
                (this.tileheight === layer.tileheight)
            );
        },

        /**
         * return the tile position corresponding to the specified pixel
         * @ignore
         */
        pixelToTileCoords : function (x, y) {
            return new me.Vector2d(this.pixelToTileX(x, y),
                                   this.pixelToTileY(y, x));
        },


        /**
         * return the tile position corresponding for the given X coordinate
         * @ignore
         */
        pixelToTileX : function (x, y) {
            return (y / this.tileheight) + ((x - this.originX) / this.tilewidth);
        },


        /**
         * return the tile position corresponding for the given Y coordinates
         * @ignore
         */
        pixelToTileY : function (y, x) {
            return (y / this.tileheight) - ((x - this.originX) / this.tilewidth);
        },

        /**
         * return the pixel position corresponding of the specified tile
         * @ignore
         */
        tileToPixelCoords : function (x, y) {
            return new me.Vector2d(
                (x - y) * this.hTilewidth + this.originX,
                (x + y) * this.hTileheight
            );
        },

        /**
         * fix the position of Objects to match
         * the way Tiled places them
         * @ignore
         */
        adjustPosition: function (obj) {
            var tilex = obj.x / this.hTilewidth;
            var tiley = obj.y / this.tileheight;
            var isoPos = this.tileToPixelCoords(tilex, tiley);

            obj.x = isoPos.x;
            obj.y = isoPos.y;
        },

        /**
         * draw the tile map
         * @ignore
         */
        drawTile : function (renderer, x, y, tmxTile, tileset) {
            // draw the tile
            tileset.drawTile(
                renderer,
                ((this.cols - 1) * tileset.tilewidth + (x - y) * tileset.tilewidth >> 1),
                (-tileset.tilewidth + (x + y) * tileset.tileheight >> 2),
                tmxTile
            );
        },

        /**
         * draw the tile map
         * @ignore
         */
        drawTileLayer : function (renderer, layer, rect) {

            // cache a couple of useful references
            var tileset = layer.tileset;
            var offset  = tileset.tileoffset;

            // get top-left and bottom-right tile position
            var rowItr = this.pixelToTileCoords(
                rect.pos.x - tileset.tilewidth,
                rect.pos.y - tileset.tileheight
            ).floorSelf();
            var TileEnd = this.pixelToTileCoords(
                rect.pos.x + rect.width + tileset.tilewidth,
                rect.pos.y + rect.height + tileset.tileheight
            ).ceilSelf();

            var rectEnd = this.tileToPixelCoords(TileEnd.x, TileEnd.y);

            // Determine the tile and pixel coordinates to start at
            var startPos = this.tileToPixelCoords(rowItr.x, rowItr.y);
            startPos.x -= this.hTilewidth;
            startPos.y += this.tileheight;

            /* Determine in which half of the tile the top-left corner of the area we
             * need to draw is. If we're in the upper half, we need to start one row
             * up due to those tiles being visible as well. How we go up one row
             * depends on whether we're in the left or right half of the tile.
             */
            var inUpperHalf = startPos.y - rect.pos.y > this.hTileheight;
            var inLeftHalf  = rect.pos.x - startPos.x < this.hTilewidth;

            if (inUpperHalf) {
                if (inLeftHalf) {
                    rowItr.x--;
                    startPos.x -= this.hTilewidth;
                }
                else {
                    rowItr.y--;
                    startPos.x += this.hTilewidth;
                }
                startPos.y -= this.hTileheight;
            }


             // Determine whether the current row is shifted half a tile to the right
            var shifted = inUpperHalf ^ inLeftHalf;

            // initialize the columItr vector
            var columnItr = rowItr.clone();

            // main drawing loop
            for (var y = startPos.y; y - this.tileheight < rectEnd.y; y += this.hTileheight) {
                columnItr.setV(rowItr);
                for (var x = startPos.x; x < rectEnd.x; x += this.tilewidth) {
                    //check if it's valid tile, if so render
                    if ((columnItr.x >= 0) && (columnItr.y >= 0) && (columnItr.x < this.cols) && (columnItr.y < this.rows)) {
                        var tmxTile = layer.layerData[columnItr.x][columnItr.y];
                        if (tmxTile) {
                            tileset = tmxTile.tileset;
                            // offset could be different per tileset
                            offset  = tileset.tileoffset;
                            // draw our tile
                            tileset.drawTile(renderer, offset.x + x, offset.y + y - tileset.tileheight, tmxTile);
                        }
                    }
                    // Advance to the next column
                    columnItr.x++;
                    columnItr.y--;
                }

                // Advance to the next row
                if (!shifted) {
                    rowItr.x++;
                    startPos.x += this.hTilewidth;
                    shifted = true;
                }
                else {
                    rowItr.y++;
                    startPos.x -= this.hTilewidth;
                    shifted = false;
                }
            }
        }
    });

     /**
     * an Hexagonal Map Renderder
     * Tiled QT 0.7.x format
     * @memberOf me
     * @ignore
     * @constructor
     */
    me.TMXHexagonalRenderer = Object.extend({
		 // constructor
        init: function (cols, rows, tilewidth, tileheight, hexsidelength, staggeraxis, staggerindex) {
            this.cols = cols;
            this.rows = rows;
            this.tilewidth = tilewidth;
            this.tileheight = tileheight;
			this.hexsidelength = hexsidelength;
			this.staggeraxis = staggeraxis;
			this.staggerindex = staggerindex;
			
			this.sidelengthx = 0;
			this.sidelengthy = 0;
			
			if(staggeraxis === "x"){
				this.sidelengthx = hexsidelength;
			} else {
				this.sidelengthy = hexsidelength;
			}
			
			this.sideoffsetx = (this.tilewidth - this.sidelengthx)/2;
			this.sideoffsety = (this.tileheight - this.sidelengthy)/2;
			
			this.columnwidth = this.sideoffsetx + this.sidelengthx;
			this.rowheight = this.sideoffsety + this.sidelengthy;
        },
		
        /**
         * return true if the renderer can render the specified layer
         * @ignore
         */
		canRender : function (layer) {
            return ((layer.orientation === "hexagonal") &&
                    (this.cols === layer.cols) &&
                    (this.rows === layer.rows) &&
                    (this.tilewidth === layer.tilewidth) &&
                    (this.tileheight === layer.tileheight));
        },

        /**
         * return the tile position corresponding to the specified pixel
         * @ignore
         */
		pixelToTileCoords : function (x, y) {
			var q,r;
			if(this.staggeraxis === "x"){ //flat top
				x = x - ((this.staggerindex === "odd") ? this.sideoffsetx : this.tilewidth);
			} else { //pointy top
				y = y - ((this.staggerindex === "odd") ? this.sideoffsety : this.tileheight);
			}
			
			// Start with the coordinates of a grid-aligned tile
			var referencePoint = {
				x : Math.floor(x / (this.tilewidth + this.sidelengthx)),
				y : Math.floor((y / (this.tileheight + this.sidelengthy))),
			};
			
			
			// Relative x and y position on the base square of the grid-aligned tile
			var rel = {
				rx : x - referencePoint.x * (this.tilewidth + this.sidelengthx),
                ry : y - referencePoint.y * (this.tileheight + this.sidelengthy),
			};

			// Adjust the reference point to the correct tile coordinates
			if(this.staggeraxis === "x"){
				referencePoint.x = referencePoint.x * 2;
				if (this.staggerindex === "even"){
					++referencePoint.x;
				}
			} else {
				referencePoint.y = referencePoint.y * 2;
				if (this.staggerindex === "even"){
					++referencePoint.y;
				}
			}

			// Determine the nearest hexagon tile by the distance to the center
			var centers = new Array(4);
			var left, top, centerX, centerY;
			if (this.staggeraxis === "x") {
				left = this.sidelengthx / 2;
				centerX = left + this.columnwidth;
				centerY = this.tileheight / 2;

				centers[0] = {rx:left,ry:centerY};
				centers[1] = {rx:centerX, ry:centerY - this.rowheight};
				centers[2] = {rx:centerX, ry:centerY + this.rowheight};
				centers[3] = {rx:centerX + this.columnwidth, ry:centerY};
			} else {
				top = this.sidelengthy / 2;
				centerX = this.tilewidth / 2;
				centerY = top + this.rowheight;

				centers[0] = {rx:centerX, ry:top};
				centers[1] = {rx:centerX - this.columnwidth, ry:centerY};
				centers[2] = {rx:centerX + this.columnwidth, ry:centerY};
				centers[3] = {rx:centerX, ry:centerY + this.rowheight};
			}

			var nearest = 0;
			var minDist = Number.MAX_VALUE;
			var dc;
			for (var i = 0; i < 4; ++i) {
				dc = Math.pow(centers[i].rx - rel.rx,2) + Math.pow(centers[i].ry - rel.ry,2);
				if (dc < minDist) {
					minDist = dc;
					nearest = i;
				}
			}

			var offsetsStaggerX = [
				{x: 0, y: 0},
				{x:+1, y:-1},
				{x:+1, y: 0},
				{x:+2, y: 0},
			];
			var offsetsStaggerY = [
				{x: 0, y: 0},
				{x:-1, y:+1},
				{x: 0, y:+1},
				{x: 0, y:+2},
			];

			var offsets = (this.staggeraxis === "x") ? offsetsStaggerX : offsetsStaggerY;
			
			q = referencePoint.x + offsets[nearest].x;
			r = referencePoint.y + offsets[nearest].y;	
			return new me.Vector2d(q,r);
        },


        /**
         * return the tile position corresponding for the given X coordinate
         * @ignore
         */
        pixelToTileX : function (x,y) {
			return this.pixelToTileCoords(x,y).x;
        },


        /**
         * return the tile position corresponding for the given Y coordinates
         * @ignore
         */
        pixelToTileY : function (y,x) {
            return this.pixelToTileCoords(x,y).y;
        },

        /**
         * return the pixel position corresponding of the specified tile
         * @ignore
         */
        tileToPixelCoords : function (q, r) {
            var x,y;
			if(this.staggeraxis === "x") //flat top
			{
				x = q * this.columnwidth;
				if(this.staggerindex === "odd")
				{
					y = r * (this.tileheight + this.sidelengthy);
					y = y + (this.rowheight*(q&1));
				} else {
					y = r * (this.tileheight + this.sidelengthy);
					y = y + (this.rowheight*(1-(q&1)));
				}
			}
			else //pointy top
			{
				y = r * this.rowheight;
				if(this.staggerindex === "odd")
				{
					x = q * (this.tilewidth + this.sidelengthx);
					x = x + (this.columnwidth*(r&1));
				} else {
					x = q * (this.tilewidth + this.sidelengthx);
					x = x + (this.columnwidth*(1-(r&1)));
				}
			}
			return new me.Vector2d(x,y);
        },

        /**
         * fix the position of Objects to match
         * the way Tiled places them
         * @ignore
         */
        adjustPosition: function (/*obj*/) {
            // TBD
        },

        /**
         * draw the tile map
         * @ignore
         */	
		drawTile : function (renderer, x, y, tmxTile, tileset) {
			var point = this.tileToPixelCoords(x,y);
			
            // draw the tile
			tileset.drawTile(renderer,
				 tileset.tileoffset.x + point.x,
				 tileset.tileoffset.y + point.y + (this.tileheight - tileset.tileheight),
				 tmxTile);
        },
		


        /**
         * draw the tile map
         * @ignore
         */
 		 drawTileLayer : function (renderer, layer, rect) {
            // get top-left and bottom-right tile position
            var start = this.pixelToTileCoords(rect.pos.x,
                                               rect.pos.y).floorSelf();

            var end = this.pixelToTileCoords(rect.pos.x + rect.width + this.tilewidth,
                                             rect.pos.y + rect.height + this.tileheight).ceilSelf();

            //ensure we are in the valid tile range
            start.x = start.x < 0 ? 0 : start.x;
            start.y = start.y < 0 ? 0 : start.y;
            end.x = end.x > this.cols ? this.cols : end.x;
            end.y = end.y > this.rows ? this.rows : end.y;

            // main drawing loop
            for (var y = start.y; y < end.y; y++) {
                for (var x = start.x; x < end.x; x++) {
                    var tmxTile = layer.layerData[x][y];
                    if (tmxTile) {
                        this.drawTile(renderer, x, y, tmxTile, tmxTile.tileset);
                    }
                }
            }
        }
		
    });

})();
