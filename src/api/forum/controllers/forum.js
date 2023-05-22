'use strict';

/**
 * forum controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::forum.forum', ({ strapi }) => ({
  // 로그인된 유저만 포럼 등록 가능
  async create(ctx) {
    let entity;
    if (ctx.is("multipart")) {
      const { data, files } = parseMultipartData(ctx);
      data.user = ctx.state.user.id;
      entity = await strapi.entityService.create("api::forum.forum", {
        data: {
          data,
          files,
        },
      });
    } else {
      ctx.request.body.data.user = ctx.state.user.id;
      ctx.request.body.data.publishedAt = new Date();
      entity = await strapi.entityService.create(
        "api::forum.forum",
        ctx.request.body
      );
    }
    return entity;
  },

  // 포럼 수정
  async update(ctx) {
    const { id } = ctx.params;
    const query = {
      filters: {
        id: id,
        user: { id: ctx.state.user.id },
      },
    };
    ctx.query = query;

    const user = await strapi.entityService.findOne("api::forum.forum", id, {
      populate: { user: true },
    });

    if (user.user.id === ctx.state.user.id) {
      return await super.update(ctx);
    } else {
      return ctx.unauthorized(`You can't update this entry`);
    }
  },

  // 포럼 삭제
  async delete(ctx) {
    const { id } = ctx.params;

    const user = await strapi.entityService.findOne("api::forum.forum", id, {
      populate: { user: true },
    });

    if (user.user.id === ctx.state.user.id) {
      const deletedForum = await strapi.entityService.delete(
        "api::forum.forum",
        id
      );
      const sanitizedDeletedForum = await this.sanitizeOutput(deletedForum);
      return this.transformResponse(sanitizedDeletedForum);
    } else {
      return ctx.unauthorized(`You can only delete events you own`);
    }
  },

  // 로그인된 유저의 포럼 받기
  async me(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.badRequest(null, [
        { messages: 'No authorization header was found' },
      ]);
    }

    const forums = await strapi.entityService.findMany("api::forum.forum", {
      filters: { user: user.id },
    });

    const sanitizedForums = await this.sanitizeOutput(forums);

    return this.transformResponse(sanitizedForums);
  },
}));
