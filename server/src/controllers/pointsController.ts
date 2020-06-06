import { Request, Response } from "express";
import knex from "../database/connection";

class PointsController {
  async index(req: Request, res: Response) {
    const { city, uf, items } = req.query;

    const parsedItems = String(items)
      .split(',')
      .map(item => Number(item.trim()));

    const points = await knex("points")
      .join("point_items", "points.id", "=", "point_items.id_point")
      .whereIn("point_items.id_item", parsedItems)
      .where("city", String(city))
      .where("uf", String(uf))
      .distinct()
      .select("points.*");

    return res.json(points);
  }

  async show(req: Request, res: Response) {
    const { id } = req.params;

    const point = await knex("points").where("id", id).first();

    if (!point) {
      return res.status(400).json({ message: "Point not found." });
    }

    /**
     * SELECT * FROM items
     *  JOIN point_items ON items.id = point_items.id_item
     * WHERE point_items.id_point = (id)
     */

    const items = await knex("items")
      .join("point_items", "items.id", "=", "point_items.id_item")
      .where("point_items.id_point", id)
      .select("items.title");

    return res.json({ point, items });
  }

  async create(req: Request, res: Response) {
    const {
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf,
      items,
    } = req.body;

    const trx = await knex.transaction();

    const point = {
      image: "https://source.unsplash.com/random",
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf,
    };

    const insertedIds = await trx("points").insert(point);

    const id_point = insertedIds[0];

    const pointItems = items.map((id_item: number) => {
      return {
        id_item,
        id_point,
      };
    });


    await trx("point_items").insert(pointItems);
    await trx.commit();

    return res.json({
      id: id_point,
      ...point,
    });
  }
}

export default PointsController;