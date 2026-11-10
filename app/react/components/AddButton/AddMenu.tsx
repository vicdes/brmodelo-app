import { useWorkloadModal } from "@components/PolyglotModals/useWorkloadModal";
import React from "react";
import { useTranslation } from "react-i18next";

export type Type = "workload" | "nfr";

interface AddMenuProps {
	onSelect: (type: Type, value: string[]) => void;
	initialValues: string[];
	onModalOpenChange?: (open: boolean) => void;
	selectedValue: string[]
}

const AddMenu: React.FC<AddMenuProps> = ({
	onSelect,
	initialValues,
	onModalOpenChange,
	selectedValue
}) => {
	const [isOpen, setIsOpen] = React.useState(false);
	const [selectedType, setSelectedType] = React.useState<Type | null>(null);
	const createWorkloadModal = useWorkloadModal(initialValues, setIsOpen, selectedValue);

	React.useEffect(() => {
		onModalOpenChange?.(isOpen);
		return () => onModalOpenChange?.(false);
	}, [isOpen, onModalOpenChange]);

	const { t } = useTranslation(["common"]);

	const handleOpen = (item: Type) => {
		setIsOpen(true);
		setSelectedType(item);
	};

	const handleOpenWorkload = () => {
		createWorkloadModal
			.open()
			.then((result) => {
				onSelect("workload", result);
			})
			.catch((reason) => {
				if ((reason as any)?.reason === "cancel") return;
			});
	};

	return (
		<div>
			<button onClick={handleOpenWorkload} className="add-menu">
				{t("Workload")}
			</button>
			<button onClick={() => handleOpen("nfr")} className="add-menu">
				{t("Non-functional requirement")}
			</button>
			{/* {selectedType === "workload" ? (

				// <WorkloadModal
				// 	open={isOpen}
				// 	initialValues={initialValues}
				// 	onCancel={() => setIsOpen(false)}
				// 	onSuccess={(value) => {
				// 		onSelect(selectedType, value);
				// 		setIsOpen(false);
				// 		onSuccess()
				// 	}}
				// />
			) : (
				<NfrModal
					open={isOpen}
					initialValues={initialValues}
					onCancel={() => setIsOpen(false)}
					onSuccess={(value) => {
						onSelect(selectedType, value);
						setIsOpen(false);
						onSuccess()
					}}
				/>
			)} */}
		</div>
	);
};

export default AddMenu;
