const {
  EmbedBuilder,
  SlashCommandBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

module.exports = {
  data: new SlashCommandBuilder()
    .setName("meme")
    .setDescription("Get a juicy meme")
    .addStringOption((option) =>
      option
        .setName("platform")
        .setDescription("Meme Platform (Not Required)")
        .addChoices(
          { name: "Reddit", value: "reddit" },
          { name: "Sticker", value: "sticker" }
        )
    ),
  category: "General",
  run: async (client, interaction, config) => {
    const { guild, options, member } = interaction;

    const platform = options.getString("platform");

    async function redditMeme() {
      await fetch("https://reddit.com/r/memes/random/.json").then(
        async (res) => {
          let meme = await res.json();

          let title = meme[0].data.children[0].data.title;
          let url = meme[0].data.children[0].data.url;
          let author = meme[0].data.children[0].data.author;
          let upvotes = meme[0].data.children[0].data.ups;
          let comments = meme[0].data.children[0].data.num_comments;

          const embed = new EmbedBuilder()
            .setTitle(title)
            .setURL(url)
            .setImage(url)
            .setFooter({
              text: `Posted by u/${author} | 👍 ${upvotes} upvotes | 💬 ${comments} comments`,
            });

          return interaction.reply({ embeds: [embed] });
        }
      );
    }

    async function giphyMeme() {
      await fetch(
        "https://api.giphy.com/v1/stickers/random?api_key=gmVJSfmBTiNBFgRWTxg3gndEDXt60Dcy&tag=&rating=g"
      ).then(async (res) => {
        let meme = await res.json();

        let title = meme.data.title;
        let url = meme.data.images.original.url;
        let link = meme.data.url;
        let author = meme.data.user.display_name;
        let pf = meme.data.user.avatar_url;

        const embed = new EmbedBuilder()
          .setTitle(title)
          .setURL(link)
          .setImage(url)
          .setFooter({
            text: `Posted by ${author}`,
            iconURL: `${pf}`,
          });

        return interaction.reply({ embeds: [embed] });
      });
    }

    if (platform === "reddit") {
      redditMeme();
    }

    if (platform === "sticker") {
      giphyMeme();
    }

    if (!platform) {
      let memes = [redditMeme, giphyMeme];
      memes[Math.floor(Math.random() * memes.length)]();
    }
  },
};
