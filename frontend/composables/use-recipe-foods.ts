import { useAsync, ref, reactive } from "@nuxtjs/composition-api";
import { useAsyncKey } from "./use-utils";
import { useApiSingleton } from "~/composables/use-api";
import { Food } from "~/api/class-interfaces/recipe-foods";

export const useFoods = function () {
  const api = useApiSingleton();
  const loading = ref(false);
  const deleteTargetId = ref(0);
  const validForm = ref(true);

  const workingFoodData = reactive({
    id: 0,
    name: "",
    description: "",
  });

  const actions = {
    getAll() {
      loading.value = true;
      const units = useAsync(async () => {
        const { data } = await api.foods.getAll();
        return data;
      }, useAsyncKey());

      loading.value = false
      return units;
    },
    async refreshAll() {
      loading.value = true;
      const { data } = await api.foods.getAll();

      if (data) {
        foods.value = data;
      }

      loading.value = false;
    },
    async createOne(domForm: VForm | null = null) {
      if (domForm && !domForm.validate()) {
        validForm.value = false;
        return;
      }

      loading.value = true;
      const { data } = await api.foods.createOne(workingFoodData);
      if (data && foods.value) {
        foods.value.push(data);
      } else {
        this.refreshAll();
      }
      domForm?.reset();
      validForm.value = true;
      this.resetWorking();
      loading.value = false;
    },
    async updateOne() {
      if (!workingFoodData.id) {
        return;
      }

      loading.value = true;
      const { data } = await api.foods.updateOne(workingFoodData.id, workingFoodData);
      if (data && foods.value) {
        this.refreshAll();
      }
      loading.value = false;
    },
    async deleteOne(id: string | number) {
      loading.value = true;
      const { data } = await api.foods.deleteOne(id);
      if (data && foods.value) {
        this.refreshAll();
      }
    },
    resetWorking() {
      workingFoodData.id = 0;
      workingFoodData.name = "";
      workingFoodData.description = "";
    },
    setWorking(item: Food) {
      workingFoodData.id = item.id;
      workingFoodData.name = item.name;
      workingFoodData.description = item.description;
    },
  };

  const foods = actions.getAll();

  return { foods, workingFoodData, deleteTargetId, actions, validForm };
};