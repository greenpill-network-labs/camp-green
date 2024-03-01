// import { toast } from "react-toastify";
import { createMachine, assign } from "xstate";
import { provider } from "viem";
import {
  EAS,
  Offchain,
  SchemaEncoder,
  SchemaRegistry,
} from "@ethereum-attestation-service/eas-sdk";

export const EASContractAddress = "0xC2679fBD37d54388Ce493F1DB75320D236e1815e"; // Sepolia v0.26

// Initialize the sdk with the address of the EAS Schema contract address
const eas = new EAS(EASContractAddress);

// Gets a default provider (in production use something else like infura/alchemy)
const provider = ethers.getDefaultProvider("sepolia");

export interface WorkContext {
  title: string | null;
  description: string | null;
  start_date: number | null;
  end_date: number | null;
  media: File[];
  capitals: Capital[];
  error: string | null;
}

export const workMachine = createMachine(
  {
    id: "work",
    description: "Work machine for providing data of work for campaign.",
    strict: true,
    tsTypes: {} as import("./machine.typegen").Typegen0,
    predictableActionArguments: true,
    initial: "idle",
    schema: {
      services: {} as {
        mediaUploader: {
          data: {
            plantId: number;
            // details: PlantDetails | undefined;
            img: string;
          };
        };
        workAttester: {
          data: {
            element: any;
            img: string;
          };
        };
      },
      context: {
        title: null,
        description: null,
        start_date: null,
        end_date: null,
        media: [],
        capitals: [],
        error: null,
      } as WorkContext,
    },
    states: {
      idle: {
        on: {
          ATTEST_WORK: {
            target: "details",
            // cond: "areDetailsValid",
          },
        },
      },
      details: {
        on: {
          NEXT: {
            target: "media",
          },
          CANCEL: {
            target: "idle",
          },
        },
      },
      media: {
        on: {
          NEXT: {
            target: "media",
          },
          BACK: {
            target: "details",
          },
          CANCEL: {
            target: "idle",
          },
        },
      },
      review: {
        on: {
          CREATE: {
            target: "uploading_media",
          },
          BACK: {
            target: "media",
          },
          CANCEL: {
            target: "idle",
          },
        },
      },
      uploading_media: {
        invoke: {
          id: "mediaUploader",
          src: "mediaUploader",
          onDone: {
            target: "attesting_work",
            actions: "verified",
          },
          onError: {
            target: "review",
            actions: "error",
          },
        },
      },
      attesting_work: {
        invoke: {
          id: "workAttester",
          src: "workAttester",
          onDone: {
            target: "work_attested",
            actions: "worked",
          },
          onError: {
            target: "review",
            actions: "error",
          },
        },
      },
      work_attested: {
        on: {
          VIEW_WORK: {
            target: "idle",
            actions: "reset",
          },
        },
      },
    },
    entry: async (context) => {
      // context.element = null;
      // context.creature = null;
      // toast.info("Work machine entered.");
    },
    // exit: (context, event) => {
    //   console.log("Work machine exited.", context, event);
    // },
  },
  {
    delays: {
      LIGHT_DELAY: (_context, _event) => {
        return true;
      },
    },
    guards: {
      areDetailsValid: (_context, event: { image: string | ArrayBuffer }) => {
        return !!event.image;
      },
      isMediaValid: (context) => {
        return !context.creature && !!context.element;
      },
    },
    actions: {
      reset: assign((context, _event) => {
        // context.element = null;
        // context.plant = null;
        // context.creature = null;

        return context;
      }),
      error: assign((context, event) => {
        switch (event.type) {
          case "error.platform.mediaUploader":
            // context.image = null;
            // context.element = null;

            // @ts-ignore
            context.error = event.data.message;
            break;

          case "error.platform.workAttester":
            // @ts-ignore
            context.error = event.data.message;
            break;

          default:
            break;
        }
        console.log("Error!", context, event);

        // toast.error(context.error || "Error with creature generator.");

        return context;
      }),
    },
    services: {
      mediaUploader: async (context, event: { image?: string }, _meta) => {
        let image: string | null = context.image;

        if (event.image) {
          image = event.image;
        }

        if (!image) {
          throw new Error("No image provided!");
        }

        // TODO: Add form image upload
        // const formData = new FormData();

        // formData.append("image", image, image.name);

        // const data = {
        //   // Add other parameters here
        // };
        // formData.append("data", JSON.stringify(data));

        try {
          // const { data } = await apiClient.post<{ plant: PlantResponse }>(
          //   "/plants/detect",
          //   { image },
          // );

          return {
            // plantId: data.plant.suggestions[0].id,
            // details: data.plant.suggestions[0].plant_details,
            img: image,
          };
        } catch (error) {
          console.log("Photo verification failed!", error);
          throw error;
        }
      },
      workAttester: async (context, event: { element?: any }) => {
        let element: any | null = context.element;

        if (event.element) {
          element = event.element;
          // context.element = event.element;
        }

        if (!element || !context.plant) {
          throw new Error("No element or plant provided!");
        }

        try {
          return { element, img: `data:image/png;base64,${data.img}` };
        } catch (error) {
          console.log("Creature generation failed!", error);
          throw error;
        }
      },
    },
  },
);